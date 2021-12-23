use std::sync::Arc;

use crate::auth;
use actix_web::{HttpRequest, HttpResponse, Responder};
use derive_more::From;
use futures::{AsyncRead, Stream};
use log::error;
use mongodb::bson::{doc, oid::ObjectId};
use mongodb_gridfs::options::GridFSUploadOptions;
use mongodb_gridfs::{GridFSBucket, GridFSError};

use crate::database::{self, Database};
use crate::shared::ErrorResponse;

use super::model::{DatabaseImageFile, ImageFile};

pub const FILES_COLLECTION_METADATA: &str = "fs.files";

#[derive(Debug, From)]
pub enum ServeError {
    Database(database::Error),
    ObjectID(mongodb::bson::oid::Error),
}
pub trait DatabaseFileStream: Stream<Item = Vec<u8>> {}
pub type ServeResult<T> = std::result::Result<T, ServeError>;

#[derive(Debug, From)]
pub enum UploadError {
    Database(database::DatabaseError),
    Unauthorised(auth::VerifyError),
}
pub type UploadResult<T> = std::result::Result<T, UploadError>;

#[derive(Debug, From)]
pub enum DeleteError {
    Database(database::Error),
    ObjectID(mongodb::bson::oid::Error),
    Unauthorised(auth::VerifyError),
}
pub type DeleteResult = std::result::Result<bool, DeleteError>;

pub struct Repo {
    db: Arc<Database>,
}

impl Repo {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub async fn serve(&self, id: &str) -> ServeResult<Option<impl DatabaseFileStream>> {
        let oid = ObjectId::parse_str(id)?;
        match self.gridfs().open_download_stream(oid).await {
            Ok(v) => Ok(Some(v)),
            Err(GridFSError::FileNotFound()) => Ok(None),
            Err(GridFSError::MongoError(e)) => {
                Err(ServeError::Database(database::Error::Database(e)))
            }
        }
    }

    pub async fn upload(
        &self,
        name: &str,
        description: &str,
        istream: impl AsyncRead + Unpin,
    ) -> UploadResult<ImageFile> {
        let options = GridFSUploadOptions::builder()
            .metadata(Some(doc! { "description": description }))
            .build();
        let oid = self
            .gridfs()
            .upload_from_stream(name, istream, Some(options))
            .await?;
        let col = self
            .db
            .db()
            .collection::<DatabaseImageFile>(FILES_COLLECTION_METADATA);
        let found = col.find_one(doc! { "_id": oid }, None).await?;
        Ok(found
            .map(DatabaseImageFile::into)
            .expect("the item should've just been created"))
    }

    pub async fn delete(&self, id: &str) -> DeleteResult {
        let oid = ObjectId::parse_str(id)?;
        match self.gridfs().delete(oid).await {
            Ok(()) => Ok(true),
            Err(GridFSError::FileNotFound()) => Ok(false),
            Err(GridFSError::MongoError(e)) => {
                Err(DeleteError::Database(database::Error::Database(e)))
            }
        }
    }

    fn gridfs(&self) -> GridFSBucket {
        GridFSBucket::new(self.db.db().clone(), None)
    }
}

impl Responder for ServeError {
    fn respond_to(self, req: &HttpRequest) -> HttpResponse {
        match self {
            Self::Database(e) => e.respond_to(req),
            Self::ObjectID(e) => DeleteError::ObjectID(e).respond_to(req),
        }
    }
}

impl Responder for UploadError {
    fn respond_to(self, req: &HttpRequest) -> HttpResponse {
        match self {
            Self::Database(e) => database::Error::Database(e).respond_to(req),
            Self::Unauthorised(e) => e.respond_to(req),
        }
    }
}

impl Responder for DeleteError {
    fn respond_to(self, req: &HttpRequest) -> HttpResponse {
        match self {
            Self::Database(e) => e.respond_to(req),
            Self::ObjectID(e) => {
                error!("Error parsing OID at {}: {}", req.uri(), e);
                HttpResponse::BadRequest().json(ErrorResponse::new(format!("{}", e)))
            }
            Self::Unauthorised(e) => e.respond_to(req),
        }
    }
}

impl<T> DatabaseFileStream for T where T: Stream<Item = Vec<u8>> {}
