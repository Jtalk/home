use std::sync::Arc;

use actix_session::Session;

use crate::auth;
use crate::database::{self, Database};
use crate::shared::crud::get::{FindResult, FindService};
use crate::shared::crud::update::{UpdateResult, UpdateService};

use super::model::{DatabaseFooter, Footer, STATIC_FOOTER_ID};

const TABLE_METADATA: &'static database::CollectionMetadata = "footer";

pub struct Service {
    find: FindService,
    update: UpdateService,
}

impl Service {
    pub fn new(db: Arc<Database>, auth_service: Arc<auth::Service>) -> Self {
        Self {
            find: FindService::new(TABLE_METADATA, db.clone(), auth_service.clone()),
            update: UpdateService::new(TABLE_METADATA, db.clone(), auth_service.clone()),
        }
    }

    pub async fn find(&self) -> FindResult<Footer> {
        self.find
            .find::<Footer, DatabaseFooter>(STATIC_FOOTER_ID)
            .await
    }

    pub async fn update(&self, session: &Session, data: Footer) -> UpdateResult<Footer> {
        self.update
            .update::<Footer, DatabaseFooter>(session, STATIC_FOOTER_ID, data)
            .await
    }
}
