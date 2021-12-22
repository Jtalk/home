use std::convert::Infallible;
use std::sync::Arc;

use actix_session::Session;
use actix_web::{HttpRequest, HttpResponse, Responder};
use derive_more::From;
use log::warn;
use serde::de::DeserializeOwned;
use serde::Serialize;

use crate::database::CollectionMetadata;
use crate::shared::ErrorResponse;
use crate::{auth, database};

#[derive(Debug, From)]
pub enum UpdateError {
    Database(database::Error),
    Format(database::oid::ConversionError),
    Unauthorised(auth::VerifyError),
    Infallible(Infallible),
}
pub type UpdateResult<T> = std::result::Result<T, UpdateError>;

pub struct UpdateService {
    meta: &'static CollectionMetadata,
    db: Arc<database::Database>,
    auth: Arc<auth::Service>,
}

impl UpdateService {
    pub fn new(
        meta: &'static CollectionMetadata,
        db: Arc<database::Database>,
        auth: Arc<auth::Service>,
    ) -> Self {
        Self { meta, db, auth }
    }

    pub async fn update<T, DT>(&self, session: &Session, data: T) -> UpdateResult<T>
    where
        DT: 'static
            + TryFrom<T>
            + Into<T>
            + Serialize
            + DeserializeOwned
            + HasID
            + Send
            + Sync
            + Unpin,
        T: 'static,
        UpdateError: From<<DT as TryFrom<T>>::Error>,
    {
        self.auth.verify(session)?;
        let db_update: DT = DT::try_from(data)?;
        let result: DT = self.db.replace(&self.meta, db_update).await?;
        Ok(result.into())
    }
}

impl Responder for UpdateError {
    fn respond_to(self, req: &HttpRequest) -> HttpResponse {
        match self {
            Self::Database(e) => e.respond_to(req),
            Self::Unauthorised(e) => e.respond_to(req),
            Self::Format(e) => {
                warn!(
                    "Unsupported field value while calling {}: {:?}",
                    req.uri(),
                    e
                );
                HttpResponse::BadRequest().json(ErrorResponse::new(format!(
                    "Unsupported field value: {}",
                    e
                )))
            }
            Self::Infallible(_) => panic!("Impossible conversion error"),
        }
    }
}
