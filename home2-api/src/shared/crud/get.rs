use std::sync::Arc;

use derive_more::From;
use serde::de::DeserializeOwned;

use crate::database::{self, CollectionMetadata};

#[derive(From)]
pub enum FindError {
    Database(database::Error),
    NotFound(),
}
pub type ListResult<T> = std::result::Result<T, database::Error>;
pub type FindResult<T> = std::result::Result<T, FindError>;

pub struct FindService {
    meta: &'static CollectionMetadata,
    db: Arc<database::Database>,
}

impl FindService {
    pub fn new(meta: &'static CollectionMetadata, db: Arc<database::Database>) -> Self {
        Self { meta, db }
    }

    pub async fn find<T, DT>(&self, id: &str) -> FindResult<T>
    where
        DT: 'static + Into<T> + DeserializeOwned + Send + Sync + Unpin,
        T: 'static,
    {
        let result = self.db.find::<DT>(self.meta, id).await?;
        result.map(DT::into).ok_or_else(|| FindError::NotFound())
    }

    pub async fn list<T, DT>(&self) -> ListResult<Vec<T>>
    where
        DT: 'static + Into<T> + DeserializeOwned + Send + Sync + Unpin,
        T: 'static,
    {
        let found: Vec<DT> = self.db.list(self.meta).await?;
        let converted: Vec<T> = found.into_iter().map(DT::into).collect();
        Ok(converted)
    }
}
