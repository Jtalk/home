use std::sync::Arc;

use actix_session::Session;
use futures::AsyncRead;

use crate::auth;
use crate::database::{Database, ListOptions, OrderedPaginationOptions, PaginationOptions};
use crate::shared::crud::get::{FindService, ListResult};

use super::model::{DatabaseImageFile, ImageFile, ImageFileFieldName};
use super::repo::Repo;
use super::repo::{DatabaseFileStream, FILES_COLLECTION_METADATA};
pub use super::repo::{DeleteResult, ServeResult, UploadError, UploadResult};

pub struct Service {
    repo: Arc<Repo>,
    auth: Arc<auth::Service>,
    find: FindService,
}

impl Service {
    pub fn new(repo: Arc<Repo>, db: Arc<Database>, auth: Arc<auth::Service>) -> Self {
        Self {
            repo,
            auth: auth.clone(),
            find: FindService::new(FILES_COLLECTION_METADATA, db, auth),
        }
    }

    pub async fn list(
        &self,
        session: &Session,
        page: u32,
        page_size: u32,
    ) -> ListResult<ImageFile> {
        let options = ListOptions {
            pagination: Some(OrderedPaginationOptions {
                pagination: Some(PaginationOptions { page, page_size }),
                order: &ImageFileFieldName::Uploaded,
            }),
            filter: None,
        };
        let found = self
            .find
            .list::<ImageFile, DatabaseImageFile>(session, &options)
            .await?;
        Ok(found)
    }

    pub async fn serve(&self, id: &str) -> ServeResult<Option<impl DatabaseFileStream>> {
        self.repo.serve(id).await
    }

    pub async fn upload(
        &self,
        session: &Session,
        name: &str,
        description: &str,
        istream: impl AsyncRead + Unpin,
    ) -> UploadResult<ImageFile> {
        self.auth.verify(session)?;
        self.repo.upload(name, description, istream).await
    }

    pub async fn delete(&self, session: &Session, id: &str) -> DeleteResult {
        self.auth.verify(session)?;
        self.repo.delete(id).await
    }
}
