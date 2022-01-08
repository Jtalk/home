use std::sync::Arc;

use actix_session::Session;

use crate::auth;
use crate::database::{Database, Persisted};
use crate::shared::crud::get::{FindResult, FindService};
use crate::shared::crud::update::{UpdateResult, UpdateService};

use super::model::{DatabaseOwnerInfo, OwnerInfo, STATIC_OWNER_ID};

pub struct OwnerService {
    find: FindService<OwnerInfo, DatabaseOwnerInfo>,
    update: UpdateService,
}

impl OwnerService {
    pub fn new(db: Arc<Database>, auth_service: Arc<auth::Service>) -> Self {
        Self {
            find: FindService::new(db.clone(), auth_service.clone()),
            update: UpdateService::new(
                DatabaseOwnerInfo::COLLECTION,
                db.clone(),
                auth_service.clone(),
            ),
        }
    }

    pub async fn find(&self) -> FindResult<OwnerInfo> {
        self.find.find(STATIC_OWNER_ID).await
    }

    pub async fn update(&self, session: &Session, data: OwnerInfo) -> UpdateResult<OwnerInfo> {
        self.update
            .update::<OwnerInfo, DatabaseOwnerInfo>(session, STATIC_OWNER_ID, data)
            .await
    }
}
