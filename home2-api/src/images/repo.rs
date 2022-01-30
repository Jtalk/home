use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, Responder};
use derive_more::From;
use futures::{AsyncRead, Stream};
use log::{error, warn};
use mongodb::bson::{doc, oid::ObjectId, to_document};
use mongodb_gridfs::options::GridFSUploadOptions;
use mongodb_gridfs::{GridFSBucket, GridFSError};

use crate::auth;
use crate::database::oid::ObjectID;
use crate::database::{self, Database, Persisted};
use crate::images::model::ImageMetadata;
use crate::shared::ErrorResponse;
use uuid::Uuid;

use super::model::{DatabaseImageFile, ImageFile};

pub struct UploadRequest<'a, S: AsyncRead + Unpin> {
    pub name: &'a str,
    pub description: &'a str,
    pub content_type: &'a str,
    pub stream: S,
}

#[derive(Debug, From)]
pub enum FindImageIdError {
    Database(database::DatabaseError),
    ObjectID(mongodb::bson::oid::Error),
    NotFound,
}

#[derive(Debug, From)]
pub enum ServeError {
    Database(database::DatabaseError),
    ObjectID(FindImageIdError),
}
pub trait DatabaseFileStream: Stream<Item = Vec<u8>> {}
pub struct ServeResponse<T: DatabaseFileStream> {
    pub info: ImageFile,
    pub stream: T,
}
pub type ServeResult<T> = std::result::Result<Option<ServeResponse<T>>, ServeError>;

#[derive(Debug, From)]
pub enum UploadError {
    Database(database::DatabaseError),
    Unauthorised(auth::VerifyError),
}
pub type UploadResult<T> = std::result::Result<T, UploadError>;

#[derive(Debug, From)]
pub enum DeleteError {
    Database(database::Error),
    ObjectID(FindImageIdError),
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

    pub async fn serve(&self, id: &str) -> ServeResult<impl DatabaseFileStream> {
        let oid = self.find_id(id).await?;
        let info_opt = self
            .db
            .db()
            .collection::<DatabaseImageFile>(DatabaseImageFile::COLLECTION)
            .find_one(doc! { "_id": oid }, None)
            .await?;
        if let None = info_opt {
            return Ok(None); // Early exit to avoid the below await.
        }
        let open_result = self.gridfs().open_download_stream(oid).await;
        info_opt.map_or(Ok(None), |info| match open_result {
            Ok(v) => Ok(Some(ServeResponse {
                info: info.into(),
                stream: v,
            })),
            Err(GridFSError::FileNotFound()) => Ok(None),
            Err(GridFSError::MongoError(e)) => Err(ServeError::Database(e)),
        })
    }

    pub async fn upload<'a>(
        &self,
        req: UploadRequest<'a, impl AsyncRead + Unpin>,
    ) -> UploadResult<ImageFile> {
        let meta = to_document(&ImageMetadata {
            content_type: req.content_type.to_string(),
            description: req.description.to_string(),
        })
        .map_err(|e| UploadError::Database(database::DatabaseError::from(e)))?;

        let options = GridFSUploadOptions::builder().metadata(Some(meta)).build();
        let oid = self
            .gridfs()
            .upload_from_stream(req.name, req.stream, Some(options))
            .await?;
        let col = self
            .db
            .db()
            .collection::<DatabaseImageFile>(DatabaseImageFile::COLLECTION);
        let found = col.find_one(doc! { "_id": oid }, None).await?;
        Ok(found
            .map(DatabaseImageFile::into)
            .expect("the item should've just been created"))
    }

    pub async fn delete(&self, id: &str) -> DeleteResult {
        let oid = self.find_id(id).await?;
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

    async fn find_id(&self, id: &str) -> std::result::Result<ObjectId, FindImageIdError> {
        match Uuid::parse_str(id) {
            Ok(_) => {
                let result: Option<DatabaseImageFile> = self
                    .db
                    .db()
                    .collection(DatabaseImageFile::COLLECTION)
                    .find_one(
                        doc! {
                            "old_id": id
                        },
                        None,
                    )
                    .await?;
                if let Some(found) = result {
                    match found.id {
                        ObjectID::Raw(Some(v)) => Ok(v),
                        _ => unreachable!(),
                    }
                } else {
                    Err(FindImageIdError::NotFound)
                }
            }
            Err(e) => {
                warn!("Old style image ID was used: {}, {:#?}", id, e);
                Ok(ObjectId::parse_str(id)?)
            }
        }
    }
}

impl Responder for FindImageIdError {
    fn respond_to(self, req: &HttpRequest) -> HttpResponse {
        match self {
            Self::Database(e) => database::Error::Database(e).respond_to(req),
            Self::ObjectID(e) => {
                error!(
                    "Error converting old style UUID image IDs into bson ObjectId at {}: {}",
                    req.uri(),
                    e
                );
                HttpResponse::BadRequest().json(ErrorResponse::new(
                    "Image ID must be a UUID or a bson ObjectId",
                ))
            }
            Self::NotFound => HttpResponse::NotFound().finish(),
        }
    }
}

impl Responder for ServeError {
    fn respond_to(self, req: &HttpRequest) -> HttpResponse {
        match self {
            Self::Database(e) => database::Error::Database(e).respond_to(req),
            Self::ObjectID(e) => e.respond_to(req),
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
            Self::ObjectID(e) => e.respond_to(req),
            Self::Unauthorised(e) => e.respond_to(req),
        }
    }
}

impl<T> DatabaseFileStream for T where T: Stream<Item = Vec<u8>> {}
