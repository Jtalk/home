use std::result;
use std::sync::Arc;

use actix_session::Session;
use derive_more::From;

use crate::auth;
use crate::database::{self, Database};

use super::model::{DatabaseOwnerInfo, OwnerInfo, STATIC_OWNER_ID};

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
    Unauthorised(auth::VerifyError),
}
pub type FindResult<T> = result::Result<T, FindError>;
pub type UpdateResult<T> = result::Result<T, UpdateError>;

pub struct OwnerService {
    db: Arc<Database>,
    auth: Arc<auth::Service>,
}

impl OwnerService {
    pub fn new(db: Arc<Database>, auth_service: Arc<auth::Service>) -> Self {
        Self {
            db,
            auth: auth_service,
        }
    }

    pub async fn find(&self) -> FindResult<OwnerInfo> {
        let result = self
            .db
            .find::<DatabaseOwnerInfo>(TABLE_METADATA, STATIC_OWNER_ID)
            .await?;
        result
            .ok_or_else(|| FindError::NotFound())
            .map(DatabaseOwnerInfo::into)
    }

    pub async fn update(&self, session: &Session, data: OwnerInfo) -> UpdateResult<OwnerInfo> {
        self.auth.verify(session)?;
        let db_update: DatabaseOwnerInfo = DatabaseOwnerInfo::try_from(data)?;
        let result: DatabaseOwnerInfo = self.db.replace(TABLE_METADATA, db_update).await?;
        Ok(result.into())
    }
}
