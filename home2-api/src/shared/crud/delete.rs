use std::sync::Arc;

use actix_session::Session;
use actix_web::{HttpRequest, HttpResponse, Responder};
use derive_more::From;

use crate::database::CollectionMetadata;
use crate::{auth, database};

#[derive(From, Debug)]
pub enum DeleteError {
    Database(database::Error),
    Unauthorised(auth::VerifyError),
}
pub type DeleteResult<T> = std::result::Result<T, DeleteError>;

pub struct DeleteService {
    meta: &'static CollectionMetadata,
    db: Arc<database::Database>,
    auth: Arc<auth::Service>,
}

impl DeleteService {
    pub fn new(
        meta: &'static CollectionMetadata,
        db: Arc<database::Database>,
        auth: Arc<auth::Service>,
    ) -> Self {
        Self { meta, db, auth }
    }

    pub async fn delete(&self, session: &Session, id: &str) -> DeleteResult<bool> {
        self.auth.verify(session)?;
        let count = self.db.delete(self.meta, id).await?;
        Ok(count > 0)
    }
}

impl Responder for DeleteError {
    fn respond_to(self, req: &HttpRequest) -> HttpResponse {
        match self {
            Self::Database(e) => e.respond_to(req),
            Self::Unauthorised(e) => e.respond_to(req),
        }
    }
}
