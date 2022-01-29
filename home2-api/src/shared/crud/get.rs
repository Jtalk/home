use std::fmt::Debug;
use std::marker::PhantomData;
use std::sync::Arc;

use actix_session::Session;
use actix_web::{HttpRequest, HttpResponse, Responder};
use derive_more::From;
use log::warn;
use num_integer::Integer;
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};

use crate::auth;
use crate::auth::VerifyError;
use crate::database::{self, OrderedPaginationOptions, Persisted};
pub use crate::database::{FilterOptions, ListOptions, PaginationOptions, Sortable};
use crate::shared::ErrorResponse;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Pagination {
    pub total: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub current: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub page_size: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Paginated<T: Debug + Sized + Serialize> {
    pub pagination: Pagination,
    pub data: Vec<T>,
}

#[derive(Debug, From)]
pub enum FindError {
    Database(database::Error),
}
pub type FindResult<T> = std::result::Result<Option<T>, FindError>;

#[derive(Debug, From)]
pub enum ListError {
    Database(database::Error),
    Unauthorised(VerifyError),
}
pub type ListResult<T> = std::result::Result<Paginated<T>, ListError>;

pub struct FindService<T, DT> {
    db: Arc<database::Database>,
    auth: Arc<auth::Service>,

    // Store them to simplify type declaration for the below impl
    t: PhantomData<*const T>,
    dt: PhantomData<*const DT>,
}

impl<T, DT> FindService<T, DT>
where
    DT: 'static + Persisted + Into<T> + DeserializeOwned + Send + Sync + Unpin,
    T: 'static + Debug,
{
    pub fn new(db: Arc<database::Database>, auth: Arc<auth::Service>) -> Self {
        Self {
            db,
            auth,
            t: PhantomData,
            dt: PhantomData,
        }
    }

    pub async fn find(&self, id: &str) -> FindResult<T> {
        let result = self.db.find::<DT>(DT::COLLECTION, id).await?;
        Ok(result.map(DT::into))
    }

    pub async fn list(&self, session: &Session, options: &ListOptions<DT>) -> ListResult<T>
    where
        DT: Sortable,
        T: Serialize,
    {
        if !options.filter.as_ref().map_or(false, |f| f.published) {
            // Only see unpublished items when logged in
            if let Err(e) = self.auth.verify(&session) {
                return Err(ListError::Unauthorised(e));
            }
        }
        let (found, total) = self.db.list::<DT>(DT::COLLECTION, options).await?;
        let converted: Vec<T> = found.into_iter().map(DT::into).collect();
        Ok(Paginated {
            data: converted,
            pagination: pagination_from(total, &options.pagination),
        })
    }
}

fn pagination_from<T: Sortable>(
    total: u64,
    opts: &Option<OrderedPaginationOptions<T>>,
) -> Pagination {
    if let Some(p) = opts {
        let page_size: u64 = p.pagination.as_ref().map_or(1, |v| v.page_size as u64);
        Pagination {
            total: total.div_ceil(&(page_size)),
            current: p.pagination.as_ref().map(|v| v.page),
            page_size: p.pagination.as_ref().map(|v| v.page_size),
        }
    } else {
        Pagination {
            total,
            current: None,
            page_size: None,
        }
    }
}

impl Responder for FindError {
    fn respond_to(self, req: &HttpRequest) -> HttpResponse {
        match self {
            Self::Database(e) => e.respond_to(req),
        }
    }
}

impl Responder for ListError {
    fn respond_to(self, req: &HttpRequest) -> HttpResponse {
        match self {
            Self::Database(e) => e.respond_to(req),
            Self::Unauthorised(e) => {
                warn!(
                    "Unauthorised request to list unpublished items at {}: {:?}",
                    req.uri(),
                    e
                );
                HttpResponse::Forbidden().json(ErrorResponse::new(
                    "You must be authenticated to view unpublished items",
                ))
            }
        }
    }
}
