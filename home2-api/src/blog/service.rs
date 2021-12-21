use std::sync::Arc;

use actix_session::Session;
use itertools::Itertools;

use crate::auth;
use crate::database::{self, Database, ListOptions};
use crate::shared::crud::delete::{DeleteResult, DeleteService};
use crate::shared::crud::get::{FindResult, FindService, ListResult};
use crate::shared::crud::update::{UpdateResult, UpdateService};

use super::model::Article;

const TABLE_METADATA: &database::CollectionMetadata = "articles";

pub struct BlogService {
    find: FindService,
    update: UpdateService,
    delete: DeleteService,
}

impl BlogService {
    pub fn new(db: Arc<Database>, auth_service: Arc<auth::Service>) -> Self {
        Self {
            find: FindService::new(TABLE_METADATA, db.clone(), auth_service.clone()),
            update: UpdateService::new(TABLE_METADATA, db.clone(), auth_service.clone()),
            delete: DeleteService::new(TABLE_METADATA, db.clone(), auth_service.clone()),
        }
    }

    pub async fn list(
        &self,
        session: &Session,
        options: &ListOptions<Article>,
    ) -> ListResult<Article> {
        self.find.list::<Article, Article>(session, options).await
    }

    pub async fn find(&self, id: &str) -> FindResult<Article> {
        self.find.find::<Article, Article>(id).await
    }

    pub async fn update(&self, session: &Session, mut data: Article) -> UpdateResult<Article> {
        data.tags = data.tags.into_iter().unique().collect();
        self.update.update::<Article, Article>(session, data).await
    }

    pub async fn delete(&self, session: &Session, id: &str) -> DeleteResult<bool> {
        self.delete.delete(session, id).await
    }
}
