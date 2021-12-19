use std::result;
use std::sync::Arc;

use actix_session::Session;
use derive_more::From;

use crate::auth;
use crate::database::{self, Database};

use super::model::{DatabaseProject, Project};

const TABLE_METADATA: &'static database::CollectionMetadata = "projects";

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
#[derive(From)]
pub enum DeleteError {
    Database(database::Error),
    Unauthorised(auth::VerifyError),
}
pub type ListResult<T> = result::Result<T, database::Error>;
pub type FindResult<T> = result::Result<T, FindError>;
pub type UpdateResult<T> = result::Result<T, UpdateError>;
pub type DeleteResult<T> = result::Result<T, DeleteError>;

pub struct ProjectService {
    db: Arc<Database>,
    auth: Arc<auth::Service>,
}

impl ProjectService {
    pub fn new(db: Arc<Database>, auth_service: Arc<auth::Service>) -> Self {
        Self {
            db,
            auth: auth_service,
        }
    }

    pub async fn list(&self) -> ListResult<Vec<Project>> {
        let found: Vec<DatabaseProject> = self.db.list(TABLE_METADATA).await?;
        let converted = found.into_iter().map(DatabaseProject::into).collect();
        Ok(converted)
    }

    pub async fn find(&self, id: &str) -> FindResult<Project> {
        let result = self.db.find::<DatabaseProject>(TABLE_METADATA, id).await?;
        result
            .map(DatabaseProject::into)
            .ok_or_else(|| FindError::NotFound())
    }

    pub async fn update(&self, session: &Session, data: Project) -> UpdateResult<Project> {
        self.auth.verify(session)?;
        let db_update: DatabaseProject = DatabaseProject::try_from(data)?;
        let result: DatabaseProject = self.db.replace(TABLE_METADATA, db_update).await?;
        Ok(result.into())
    }

    pub async fn delete(&self, session: &Session, id: &str) -> DeleteResult<bool> {
        self.auth.verify(session)?;
        let count = self.db.delete(TABLE_METADATA, id).await?;
        Ok(count > 0)
    }
}
