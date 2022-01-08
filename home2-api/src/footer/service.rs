use std::sync::Arc;

use actix_session::Session;

use crate::auth;
use crate::database::{Database, Persisted};
use crate::shared::crud::get::{FindResult, FindService};
use crate::shared::crud::update::{UpdateResult, UpdateService};

use super::model::{DatabaseFooter, Footer, STATIC_FOOTER_ID};

pub struct Service {
    find: FindService<Footer, DatabaseFooter>,
    update: UpdateService,
}

impl Service {
    pub fn new(db: Arc<Database>, auth_service: Arc<auth::Service>) -> Self {
        Self {
            find: FindService::new(db.clone(), auth_service.clone()),
            update: UpdateService::new(
                DatabaseFooter::COLLECTION,
                db.clone(),
                auth_service.clone(),
            ),
        }
    }

    pub async fn find(&self) -> FindResult<Footer> {
        self.find.find(STATIC_FOOTER_ID).await
    }

    pub async fn update(&self, session: &Session, data: Footer) -> UpdateResult<Footer> {
        self.update
            .update::<Footer, DatabaseFooter>(session, STATIC_FOOTER_ID, data)
            .await
    }
}
