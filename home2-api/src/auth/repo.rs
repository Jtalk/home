use std::sync::Arc;

use derive_more::From;
use mockall::automock;
use mongodb::bson::doc;

use crate::database::{self, Database};

use super::model::{Authentication, LoginForm};

const AUTH_COLLECTION_META: &str = "authentication";

#[derive(Debug, From)]
pub enum Error {
    Database(database::DatabaseError),
}
pub type Result<T> = std::result::Result<T, Error>;

pub struct Repo {
    db: Arc<Database>,
}

#[automock]
impl Repo {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub async fn find_login(&self, form: &LoginForm) -> Result<Option<Authentication>> {
        let col = self
            .db
            .db()
            .collection::<Authentication>(AUTH_COLLECTION_META);
        let found = col
            .find_one(doc! {"login.login": &form.login }, None)
            .await?;
        Ok(found)
    }
}
