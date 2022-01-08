use std::sync::Arc;

use actix_session::Session;
use itertools::Itertools;

use crate::auth;
use crate::database::{Database, ListOptions, Persisted};
use crate::shared::crud::delete::{DeleteResult, DeleteService};
use crate::shared::crud::get::{FindResult, FindService, ListResult};
use crate::shared::crud::update::{UpdateResult, UpdateService};

use super::model::Article;
pub use super::repo::ListTagsResult;
use super::repo::Repo;

pub struct BlogService {
    repo: Arc<Repo>,
    find: FindService<Article, Article>,
    update: UpdateService,
    delete: DeleteService,
}

impl BlogService {
    pub fn new(db: Arc<Database>, auth_service: Arc<auth::Service>, repo: Arc<Repo>) -> Self {
        Self {
            repo,
            find: FindService::new(db.clone(), auth_service.clone()),
            update: UpdateService::new(Article::COLLECTION, db.clone(), auth_service.clone()),
            delete: DeleteService::new(Article::COLLECTION, db.clone(), auth_service.clone()),
        }
    }

    pub async fn list(
        &self,
        session: &Session,
        options: &ListOptions<Article>,
    ) -> ListResult<Article> {
        self.find.list(session, options).await
    }

    pub async fn find(&self, id: &str) -> FindResult<Article> {
        self.find.find(id).await
    }

    pub async fn tags(&self) -> ListTagsResult {
        self.repo.tags().await
    }

    pub async fn update(
        &self,
        session: &Session,
        id: &str,
        mut data: Article,
    ) -> UpdateResult<Article> {
        data.tags = data.tags.into_iter().unique().collect();
        self.update
            .update::<Article, Article>(session, id, data)
            .await
    }

    pub async fn delete(&self, session: &Session, id: &str) -> DeleteResult<bool> {
        self.delete.delete(session, id).await
    }
}
