use std::sync::Arc;

use actix_session::Session;

use crate::auth;
use crate::database::{self, Database};
use crate::shared::crud::delete::{DeleteResult, DeleteService};
use crate::shared::crud::get::{FindResult, FindService, ListResult};
use crate::shared::crud::update::{UpdateResult, UpdateService};

use super::model::{DatabaseProject, Project};

const TABLE_METADATA: &'static database::CollectionMetadata = "projects";

pub struct ProjectService {
    find: FindService,
    update: UpdateService,
    delete: DeleteService,
}

impl ProjectService {
    pub fn new(db: Arc<Database>, auth_service: Arc<auth::Service>) -> Self {
        Self {
            find: FindService::new(TABLE_METADATA, db.clone()),
            update: UpdateService::new(TABLE_METADATA, db.clone(), auth_service.clone()),
            delete: DeleteService::new(TABLE_METADATA, db.clone(), auth_service.clone()),
        }
    }

    pub async fn list(&self) -> ListResult<Vec<Project>> {
        self.find.list::<Project, DatabaseProject>().await
    }

    pub async fn find(&self, id: &str) -> FindResult<Project> {
        self.find.find::<Project, DatabaseProject>(id).await
    }

    pub async fn update(&self, session: &Session, data: Project) -> UpdateResult<Project> {
        self.update
            .update::<Project, DatabaseProject>(session, data)
            .await
    }

    pub async fn delete(&self, session: &Session, id: &str) -> DeleteResult<bool> {
        self.delete.delete(session, id).await
    }
}
