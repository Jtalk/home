use std::sync::Arc;

use actix_session::Session;
use actix_web::Either::{Left, Right};
use actix_web::{delete, get, put, web, HttpResponse, Responder};
use log::{debug, warn};
use serde::{Deserialize, Serialize};

use model::{Article, ArticleFieldName};
use repo::Repo;
use service::BlogService;

use crate::auth;
use crate::database::{Database, OrderedPaginationOptions};
use crate::shared::crud::get::{FilterOptions, ListOptions, PaginationOptions};
use crate::shared::ErrorResponse;

mod model;
mod repo;
mod service;

pub fn configure(
    db: Arc<Database>,
    auth_service: Arc<auth::Service>,
) -> impl Fn(&mut web::ServiceConfig) -> () {
    let service = web::Data::new(BlogService::new(
        db.clone(),
        auth_service,
        Arc::new(Repo::new(db.clone())),
    ));
    move |config: &mut web::ServiceConfig| {
        config
            .app_data(service.clone())
            .service(list)
            .service(find)
            .service(tags)
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
        Ok(v) => Right(HttpResponse::Ok().json(v)),
        Err(e) => Left(e),
    }
}

#[get("/blog/articles/{id}")]
async fn find(id: web::Path<String>, service: web::Data<BlogService>) -> impl Responder {
    match service.find(&id).await {
        Ok(Some(v)) => {
            // Allow accessing unpublished articles by direct link for easier sharing.
            debug!("Found article {}", id);
            Right(HttpResponse::Ok().json(v))
        }
        Ok(None) => {
            warn!("Article not found: {}", id);
            Right(HttpResponse::NotFound().json(ErrorResponse::new("Article not found")))
        }
        Err(e) => Left(e),
    }
}

#[get("/blog/tags")]
async fn tags(service: web::Data<BlogService>, req: web::HttpRequest) -> impl Responder {
    match service.tags().await {
        Ok(tags) => {
            debug!("Tags request success: {:?}", tags);
            Right(HttpResponse::Ok().json(tags))
        }
        Err(e) => Left(e.respond_to(&req)),
    }
}

#[put("/blog/articles/{id}")]
async fn update(
    id: web::Path<String>,
    session: Session,
    body: web::Json<Article>,
    service: web::Data<BlogService>,
) -> impl Responder {
    match service.update(&session, &id, body.into_inner()).await {
        Ok(v) => {
            debug!("Updated article {}: {:?}", id, v);
            Right(HttpResponse::Ok().json(v))
        }
        Err(e) => Left(e),
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
            Right(HttpResponse::Ok().finish())
        }
        Ok(false) => {
            debug!("Deleting non-existent article {}", id);
            Right(HttpResponse::NotFound().json(ErrorResponse::new("Article not found")))
        }
        Err(e) => Left(e),
    }
}

fn published_default() -> bool {
    return true;
}
fn page_size_default() -> u32 {
    return 100;
}
