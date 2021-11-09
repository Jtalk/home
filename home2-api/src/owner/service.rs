use crate::database::{self, Database};
use crate::owner::model::OwnerInfo;
use derive_more::From;
use std::result;
use std::sync::Arc;

const TABLE_NAME: &'static str = "owner";

#[derive(From)]
pub enum Error {
    Database(database::Error),
    NotFound(),
}
pub type Result<T> = result::Result<T, Error>;

pub struct OwnerService {
    db: Arc<Database>,
}

impl OwnerService {
    pub fn new(db: Arc<Database>) -> OwnerService {
        OwnerService { db }
    }

    pub async fn find(&self) -> Result<OwnerInfo> {
        let result = self.db.only(TABLE_NAME).await?;
        result.ok_or_else(|| Error::NotFound())
    }
}
