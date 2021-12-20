use std::sync::Arc;

use actix_session::Session;

use crate::auth;
use crate::database::{self, Database, Filter, ListOptions, Pagination};
use crate::shared::crud::delete::{DeleteResult, DeleteService};
use crate::shared::crud::get::{FindResult, FindService, ListResult};
use crate::shared::crud::update::{UpdateResult, UpdateService};

use super::model::{DatabaseProject, Project, ProjectFieldName};

const TABLE_METADATA: &'static database::CollectionMetadata = "projects";

pub struct ProjectService {
    find: FindService,
    update: UpdateService,
    delete: DeleteService,
}

impl ProjectService {
    pub fn new(db: Arc<Database>, auth_service: Arc<auth::Service>) -> Self {
        Self {
            find: FindService::new(TABLE_METADATA, db.clone(), auth_service.clone()),
            update: UpdateService::new(TABLE_METADATA, db.clone(), auth_service.clone()),
            delete: DeleteService::new(TABLE_METADATA, db.clone(), auth_service.clone()),
        }
    }

    pub async fn list(&self, session: &Session, published: bool) -> ListResult<Vec<Project>> {
        let options = ListOptions {
            filter: Some(Filter { published }),
            pagination: Some(Pagination {
                order: &ProjectFieldName::Order,
                page: 0,
                page_size: u32::MAX,
            }),
        };
        self.find
            .list::<Project, DatabaseProject>(session, &options)
            .await
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
