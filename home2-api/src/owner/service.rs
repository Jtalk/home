use std::result;
use std::sync::Arc;

use derive_more::From;

use crate::database::{self, Database};
use crate::owner::model::{DatabaseOwnerInfo, OwnerInfo, STATIC_OWNER_ID};

const TABLE_METADATA: &'static database::CollectionMetadata = "owner";

#[derive(From)]
pub enum FindError {
    Database(database::Error),
    NotFound(),
}
#[derive(From)]
pub enum UpdateError {
    Database(database::Error),
    Format(database::oid::ConversionError),
}
pub type FindResult<T> = result::Result<T, FindError>;
pub type UpdateResult<T> = result::Result<T, UpdateError>;

pub struct OwnerService {
    db: Arc<Database>,
}

impl OwnerService {
    pub fn new(db: Arc<Database>) -> OwnerService {
        OwnerService { db }
    }

    pub async fn find(&self) -> FindResult<OwnerInfo> {
        let result = self
            .db
            .only::<DatabaseOwnerInfo>(TABLE_METADATA, STATIC_OWNER_ID)
            .await?;
        result
            .ok_or_else(|| FindError::NotFound())
            .map(DatabaseOwnerInfo::into)
    }

    pub async fn update(&self, data: OwnerInfo) -> UpdateResult<OwnerInfo> {
        let db_update: DatabaseOwnerInfo = DatabaseOwnerInfo::try_from(data)?;
        let result: DatabaseOwnerInfo = self.db.replace(TABLE_METADATA, db_update).await?;
        Ok(result.into())
    }
}
