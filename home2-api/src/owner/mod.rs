use std::sync::Arc;

use actix_web::{get, put, web, HttpResponse, Responder};
use log::{debug, error, warn};

use crate::database::Database;
use crate::owner::model::OwnerInfo;
use crate::owner::service::{FindError, OwnerService, UpdateError};
use crate::shared::ErrorResponse;

mod model;
mod service;

pub fn configure(db: Arc<Database>) -> impl Fn(&mut web::ServiceConfig) -> () {
    let service = web::Data::new(OwnerService::new(db));
    move |config: &mut web::ServiceConfig| {
        config
            .app_data(service.clone())
            .service(find)
            .service(update);
    }
}

#[get("/owner")]
async fn find(service: web::Data<OwnerService>) -> impl Responder {
    match service.find().await {
        Ok(v) => {
            debug!("Found owner info");
            HttpResponse::Ok().json(v)
        }
        Err(FindError::Database(e)) => {
            error!("Error accessing the database in GET /owner: {:?}", e);
            HttpResponse::ServiceUnavailable().json(ErrorResponse {
                message: "Error accessing the database".into(),
            })
        }
        Err(FindError::NotFound()) => {
            // The owner info should always be there
            error!("Error finding the owner info: not found");
            HttpResponse::NotFound().json(ErrorResponse {
                message: "Not found".into(),
            })
        }
    }
}

#[put("/owner")]
async fn update(body: web::Json<OwnerInfo>, service: web::Data<OwnerService>) -> impl Responder {
    match service.update(body.into_inner()).await {
        Ok(v) => {
            debug!("Updated owner info: {:?}", v);
            HttpResponse::Ok().json(v)
        }
        Err(UpdateError::Database(e)) => {
            error!("Error accessing the database in PUT /owner: {:?}", e);
            HttpResponse::ServiceUnavailable().json(ErrorResponse {
                message: "Error accessing the database".into(),
            })
        }
        Err(UpdateError::Format(e)) => {
            warn!("Error parsing incoming request in PUT /owner: {:?}", e);
            HttpResponse::BadRequest().json(ErrorResponse {
                message: format!("Unsupported field value: {}", e),
            })
        }
    }
}
