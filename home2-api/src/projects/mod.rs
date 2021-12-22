use std::sync::Arc;

use actix_session::Session;
use actix_web::{delete, get, put, web, Either, HttpResponse, Responder};
use log::debug;
use serde::{Deserialize, Serialize};
use Either::{Left, Right};

use model::Project;

use crate::auth;
use crate::database::Database;
use crate::projects::service::ProjectService;
use crate::shared::ErrorResponse;

mod model;
mod service;

pub fn configure(
    db: Arc<Database>,
    auth_service: Arc<auth::Service>,
) -> impl Fn(&mut web::ServiceConfig) -> () {
    let service = web::Data::new(ProjectService::new(db, auth_service));
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
struct ListQuery {
    #[serde(default = "published_default")]
    published: bool,
}

#[get("/projects")]
async fn list(
    q: web::Query<ListQuery>,
    session: Session,
    service: web::Data<ProjectService>,
) -> impl Responder {
    match service.list(&session, q.published).await {
        Ok(v) => Right(HttpResponse::Ok().json(v)),
        Err(e) => Left(e),
    }
}

#[get("/projects/{id}")]
async fn find(id: web::Path<String>, service: web::Data<ProjectService>) -> impl Responder {
    match service.find(&id).await {
        Ok(Some(v)) => {
            // Allow accessing unpublished projects by direct link for easier sharing.
            debug!("Found project {}", id);
            Right(HttpResponse::Ok().json(v))
        }
        Ok(None) => {
            // Allow accessing unpublished projects by direct link for easier sharing.
            debug!("Project not found: {}", id);
            Right(HttpResponse::NotFound().json(ErrorResponse::new("Project not found")))
        }
        Err(e) => Left(e),
    }
}

#[put("/projects/{id}")]
async fn update(
    id: web::Path<String>,
    session: Session,
    body: web::Json<Project>,
    service: web::Data<ProjectService>,
) -> impl Responder {
    match service.update(&session, &id, body.into_inner()).await {
        Ok(v) => {
            debug!("Updated project {}: {:?}", id, v);
            Right(HttpResponse::Ok().json(v))
        }
        Err(e) => Left(e),
    }
}

#[delete("/projects/{id}")]
async fn delete(
    id: web::Path<String>,
    session: Session,
    service: web::Data<ProjectService>,
    req: web::HttpRequest,
) -> impl Responder {
    match service.delete(&session, &id).await {
        Ok(true) => {
            debug!("Deleted project {}", id);
            Right(HttpResponse::Ok().finish())
        }
        Ok(false) => {
            debug!("Deleting non-existent project {}", id);
            Right(HttpResponse::NotFound().json(ErrorResponse::new("Project not found")))
        }
        Err(e) => Left(e.respond_to(&req)),
    }
}

fn published_default() -> bool {
    return true;
}
