use std::sync::Arc;

use actix_web::{get, web, HttpResponse, Responder};
use log::{debug, error};

use crate::database::Database;
use crate::owner::service::{Error, OwnerService};
use crate::shared::ErrorResponse;

mod model;
mod service;

pub fn configure(db: Arc<Database>) -> impl Fn(&mut web::ServiceConfig) -> () {
    let service = web::Data::new(OwnerService::new(db));
    move |config: &mut web::ServiceConfig| {
        config.app_data(service.clone()).service(find);
    }
}

#[get("/owner")]
async fn find(service: web::Data<OwnerService>) -> impl Responder {
    match service.find().await {
        Ok(v) => {
            debug!("Found owner info");
            HttpResponse::Ok().json(v)
        }
        Err(Error::Database(e)) => {
            error!("Error accessing the database in GET /owner: {:?}", e);
            HttpResponse::ServiceUnavailable().json(ErrorResponse {
                message: "Error accessing the database".into(),
            })
        }
        Err(Error::NotFound()) => {
            // The owner info should always be there
            error!("Error finding the owner info: not found");
            HttpResponse::NotFound().json(ErrorResponse {
                message: "Not found".into(),
            })
        }
    }
}
