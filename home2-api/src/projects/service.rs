use std::sync::Arc;

use actix_session::Session;

use crate::auth;
use crate::database::{
    Database, FilterOptions, ListOptions, OrderDirection, OrderOptions, OrderedPaginationOptions,
    Persisted,
};
use crate::shared::crud::delete::{DeleteResult, DeleteService};
use crate::shared::crud::get::{FindResult, FindService, ListError};
use crate::shared::crud::update::{UpdateResult, UpdateService};

use super::model::{DatabaseProject, Project, ProjectFieldName};

pub type ListResult<T> = std::result::Result<Vec<T>, ListError>;

pub struct ProjectService {
    find: FindService<Project, DatabaseProject>,
    update: UpdateService,
    delete: DeleteService,
}

impl ProjectService {
    pub fn new(db: Arc<Database>, auth_service: Arc<auth::Service>) -> Self {
        Self {
            find: FindService::new(db.clone(), auth_service.clone()),
            update: UpdateService::new(
                DatabaseProject::COLLECTION,
                db.clone(),
                auth_service.clone(),
            ),
            delete: DeleteService::new(
                DatabaseProject::COLLECTION,
                db.clone(),
                auth_service.clone(),
            ),
        }
    }

    pub async fn list(&self, session: &Session, published: bool) -> ListResult<Project> {
        let options = ListOptions {
            filter: Some(FilterOptions { published }),
            pagination: Some(OrderedPaginationOptions {
                order: OrderOptions {
                    field: &ProjectFieldName::Order,
                    direction: OrderDirection::Asc,
                },
                pagination: None,
            }),
        };
        let result = self.find.list(session, &options).await?.data;
        Ok(result)
    }

    pub async fn find(&self, id: &str) -> FindResult<Project> {
        self.find.find(id).await
    }

    pub async fn update(
        &self,
        session: &Session,
        id: &str,
        data: Project,
    ) -> UpdateResult<Project> {
        self.update
            .update::<Project, DatabaseProject>(session, id, data)
            .await
    }

    pub async fn delete(&self, session: &Session, id: &str) -> DeleteResult<bool> {
        self.delete.delete(session, id).await
    }
}
