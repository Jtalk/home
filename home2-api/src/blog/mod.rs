use std::sync::Arc;

use actix_session::Session;
use actix_web::{delete, get, put, web, HttpResponse, Responder};
use log::{debug, error, warn};
use serde::{Deserialize, Serialize};

use model::{Article, ArticleFieldName};
use service::BlogService;

use crate::auth;
use crate::database::{Database, OrderedPaginationOptions};
use crate::shared::crud::delete::DeleteError;
use crate::shared::crud::get::{
    FilterOptions, FindError, ListError, ListOptions, PaginationOptions,
};
use crate::shared::crud::update::UpdateError;
use crate::shared::ErrorResponse;

mod model;
mod service;

pub fn configure(
    db: Arc<Database>,
    auth_service: Arc<auth::Service>,
) -> impl Fn(&mut web::ServiceConfig) -> () {
    let service = web::Data::new(BlogService::new(db, auth_service));
    move |config: &mut web::ServiceConfig| {
        config
            .app_data(service.clone())
            .service(list)
            .service(find)
            .service(update)
            .service(delete);
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ListQuery {
    #[serde(default)]
    page: u32,
    #[serde(default = "page_size_default")]
    page_size: u32,
    #[serde(default = "published_default")]
    published: bool,
}

impl Into<ListOptions<Article>> for ListQuery {
    fn into(self) -> ListOptions<Article> {
        ListOptions {
            pagination: Some(OrderedPaginationOptions {
                order: &ArticleFieldName::Created,
                pagination: Some(PaginationOptions {
                    page: self.page,
                    page_size: self.page_size,
                }),
            }),
            filter: Some(FilterOptions {
                published: self.published,
            }),
        }
    }
}

#[get("/blog/articles")]
async fn list(
    q: web::Query<ListQuery>,
    session: Session,
    service: web::Data<BlogService>,
) -> impl Responder {
    let options = q.into_inner().into();
    match service.list(&session, &options).await {
        Ok(v) => HttpResponse::Ok().json(v),
        Err(ListError::Database(e)) => {
            error!(
                "Error accessing the database in GET /blog/articles: {:?}",
                e
            );
            HttpResponse::InternalServerError().json(ErrorResponse {
                message: "Error accessing the database".into(),
            })
        }
        Err(ListError::Unauthorised(e)) => {
            warn!("Error unauthorised access to GET /blog/articles: {:?}", e);
            HttpResponse::Forbidden().json(ErrorResponse {
                message: format!("Authentication required to access unpublished articles"),
            })
        }
    }
}

#[get("/blog/articles/{id}")]
async fn find(id: web::Path<String>, service: web::Data<BlogService>) -> impl Responder {
    match service.find(&id).await {
        Ok(v) => {
            // Allow accessing unpublished articles by direct link for easier sharing.
            debug!("Found article {}", id);
            HttpResponse::Ok().json(v)
        }
        Err(FindError::Database(e)) => {
            error!(
                "Error accessing the database in GET /blog/articles/{}: {:?}",
                id, e
            );
            HttpResponse::ServiceUnavailable().json(ErrorResponse {
                message: "Error accessing the database".into(),
            })
        }
        Err(FindError::NotFound()) => {
            error!("Requested article not found: {}", id);
            HttpResponse::NotFound().json(ErrorResponse {
                message: "Not found".into(),
            })
        }
    }
}

#[put("/blog/articles/{id}")]
async fn update(
    id: web::Path<String>,
    session: Session,
    body: web::Json<Article>,
    service: web::Data<BlogService>,
) -> impl Responder {
    match service.update(&session, body.into_inner()).await {
        Ok(v) => {
            debug!("Updated article: {:?}", v);
            HttpResponse::Ok().json(v)
        }
        Err(UpdateError::Database(e)) => {
            error!(
                "Error accessing the database in PUT /blog/articles/{}: {:?}",
                id, e
            );
            HttpResponse::ServiceUnavailable().json(ErrorResponse {
                message: "Error accessing the database".into(),
            })
        }
        Err(UpdateError::Format(e)) => {
            warn!(
                "Error parsing incoming request in PUT /blog/articles/{}: {:?}",
                id, e
            );
            HttpResponse::BadRequest().json(ErrorResponse {
                message: format!("Unsupported field value: {}", e),
            })
        }
        Err(UpdateError::Unauthorised(e)) => {
            warn!(
                "Error unauthorised access to PUT /blog/articles/{}: {:?}",
                id, e
            );
            HttpResponse::Forbidden().json(ErrorResponse {
                message: format!("Authentication required"),
            })
        }
        Err(UpdateError::Infallible(_)) => {
            panic!("Impossible error")
        }
    }
}

#[delete("/blog/articles/{id}")]
async fn delete(
    id: web::Path<String>,
    session: Session,
    service: web::Data<BlogService>,
) -> impl Responder {
    match service.delete(&session, &id).await {
        Ok(true) => {
            debug!("Deleted article {}", id);
            HttpResponse::Ok().finish()
        }
        Ok(false) => {
            debug!("Deleting non-existent article {}", id);
            HttpResponse::NotFound().json(ErrorResponse {
                message: "Article not found".into(),
            })
        }
        Err(DeleteError::Database(e)) => {
            error!(
                "Error accessing the database in DELETE /blog/articles/{}: {:?}",
                id, e
            );
            HttpResponse::ServiceUnavailable().json(ErrorResponse {
                message: "Error accessing the database".into(),
            })
        }
        Err(DeleteError::Unauthorised(e)) => {
            warn!(
                "Error unauthorised access to DELETE /blog/articles/{}: {:?}",
                id, e
            );
            HttpResponse::Forbidden().json(ErrorResponse {
                message: format!("Authentication required"),
            })
        }
    }
}

fn published_default() -> bool {
    return true;
}
fn page_size_default() -> u32 {
    return 100;
}
