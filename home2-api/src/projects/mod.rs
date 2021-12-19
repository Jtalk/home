use std::sync::Arc;

use actix_session::Session;
use actix_web::{get, put, web, HttpResponse, Responder};
use log::{debug, error, warn};
use serde::{Deserialize, Serialize};

use model::Project;
use service::{FindError, ProjectService, UpdateError};

use crate::auth;
use crate::database::Database;
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
            .service(update);
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
    auth: web::Data<auth::Service>,
    req: web::HttpRequest,
) -> impl Responder {
    if !q.published {
        // Only see unpublished items when logged in
        if let Err(e) = auth.verify(&session) {
            warn!(
                "Error unauthorised access to unpublished GET /projects: {:?}",
                e
            );
            return e.respond_to(&req);
        }
    }
    match service.list().await {
        Ok(v) => {
            let filtered: Vec<Project> = v
                .into_iter()
                .filter(|p| !q.published || p.published)
                .collect();
            HttpResponse::Ok().json(filtered)
        }
        Err(e) => {
            error!("Error accessing the database in GET /projects: {:?}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                message: "Error accessing the database".into(),
            })
        }
    }
}

#[get("/projects/{id}")]
async fn find(id: web::Path<String>, service: web::Data<ProjectService>) -> impl Responder {
    match service.find(&id).await {
        Ok(v) => {
            // Allow accessing unpublished projects by direct link for easier sharing.
            debug!("Found project {}", id);
            HttpResponse::Ok().json(v)
        }
        Err(FindError::Database(e)) => {
            error!(
                "Error accessing the database in GET /projects/{}: {:?}",
                id, e
            );
            HttpResponse::ServiceUnavailable().json(ErrorResponse {
                message: "Error accessing the database".into(),
            })
        }
        Err(FindError::NotFound()) => {
            error!("Requested project not found: {}", id);
            HttpResponse::NotFound().json(ErrorResponse {
                message: "Not found".into(),
            })
        }
    }
}

#[put("/projects/{id}")]
async fn update(
    id: web::Path<String>,
    session: Session,
    body: web::Json<Project>,
    service: web::Data<ProjectService>,
) -> impl Responder {
    match service.update(&session, body.into_inner()).await {
        Ok(v) => {
            debug!("Updated project: {:?}", v);
            HttpResponse::Ok().json(v)
        }
        Err(UpdateError::Database(e)) => {
            error!(
                "Error accessing the database in PUT /project/{}: {:?}",
                id, e
            );
            HttpResponse::ServiceUnavailable().json(ErrorResponse {
                message: "Error accessing the database".into(),
            })
        }
        Err(UpdateError::Format(e)) => {
            warn!(
                "Error parsing incoming request in PUT /project/{}: {:?}",
                id, e
            );
            HttpResponse::BadRequest().json(ErrorResponse {
                message: format!("Unsupported field value: {}", e),
            })
        }
        Err(UpdateError::Unauthorised(e)) => {
            warn!("Error unauthorised access to PUT /project/{}: {:?}", id, e);
            HttpResponse::Forbidden().json(ErrorResponse {
                message: format!("Authentication required"),
            })
        }
    }
}

fn published_default() -> bool {
    return true;
}
