use actix_session::Session;
use std::sync::Arc;

use crate::auth;
use crate::auth::VerifyError;
use derive_more::From;
use serde::de::DeserializeOwned;

use crate::database::{self, CollectionMetadata};
pub use crate::database::{Filter, ListOptions, Pagination, Sortable};

#[derive(Debug, From)]
pub enum FindError {
    Database(database::Error),
    NotFound(),
}
pub type FindResult<T> = std::result::Result<T, FindError>;

#[derive(Debug, From)]
pub enum ListError {
    Database(database::Error),
    Unauthorised(VerifyError),
}
pub type ListResult<T> = std::result::Result<T, ListError>;

pub struct FindService {
    meta: &'static CollectionMetadata,
    db: Arc<database::Database>,
    auth: Arc<auth::Service>,
}

impl FindService {
    pub fn new(
        meta: &'static CollectionMetadata,
        db: Arc<database::Database>,
        auth: Arc<auth::Service>,
    ) -> Self {
        Self { meta, db, auth }
    }

    pub async fn find<T, DT>(&self, id: &str) -> FindResult<T>
    where
        DT: 'static + Into<T> + DeserializeOwned + Send + Sync + Unpin,
        T: 'static,
    {
        let result = self.db.find::<DT>(self.meta, id).await?;
        result.map(DT::into).ok_or_else(|| FindError::NotFound())
    }

    pub async fn list<T, DT>(
        &self,
        session: &Session,
        options: &ListOptions<DT>,
    ) -> ListResult<Vec<T>>
    where
        DT: 'static + Into<T> + DeserializeOwned + Send + Sync + Unpin + Sortable,
        T: 'static,
    {
        if !options.filter.as_ref().map_or(false, |f| f.published) {
            // Only see unpublished items when logged in
            if let Err(e) = self.auth.verify(&session) {
                return Err(e.into());
            }
        }
        let found: Vec<DT> = self.db.list(self.meta, options).await?;
        let converted: Vec<T> = found.into_iter().map(DT::into).collect();
        Ok(converted)
    }
}
