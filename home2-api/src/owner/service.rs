use std::sync::Arc;

use actix_session::Session;

use crate::auth;
use crate::database::{self, Database};
use crate::shared::crud::get::{FindResult, FindService};
use crate::shared::crud::update::{UpdateResult, UpdateService};

use super::model::{DatabaseOwnerInfo, OwnerInfo, STATIC_OWNER_ID};

const TABLE_METADATA: &'static database::CollectionMetadata = "owner";

pub struct OwnerService {
    find: FindService,
    update: UpdateService,
}

impl OwnerService {
    pub fn new(db: Arc<Database>, auth_service: Arc<auth::Service>) -> Self {
        Self {
            find: FindService::new(TABLE_METADATA, db.clone(), auth_service.clone()),
            update: UpdateService::new(TABLE_METADATA, db.clone(), auth_service.clone()),
        }
    }

    pub async fn find(&self) -> FindResult<OwnerInfo> {
        self.find
            .find::<OwnerInfo, DatabaseOwnerInfo>(STATIC_OWNER_ID)
            .await
    }

    pub async fn update(&self, session: &Session, data: OwnerInfo) -> UpdateResult<OwnerInfo> {
        self.update
            .update::<OwnerInfo, DatabaseOwnerInfo>(session, STATIC_OWNER_ID, data)
            .await
    }
}
