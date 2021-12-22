use std::sync::Arc;

use actix_session::Session;
use actix_web::Either::{Left, Right};
use actix_web::{get, put, web, HttpResponse, Responder};
use log::{debug, warn};

use model::OwnerInfo;
use service::OwnerService;

use crate::auth;
use crate::database::Database;
use crate::shared::ErrorResponse;

mod model;
mod service;

pub fn configure(
    db: Arc<Database>,
    auth_service: Arc<auth::Service>,
) -> impl Fn(&mut web::ServiceConfig) -> () {
    let service = web::Data::new(OwnerService::new(db, auth_service));
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
        Ok(Some(v)) => {
            debug!("Found owner info");
            Right(HttpResponse::Ok().json(v))
        }
        Ok(None) => {
            warn!("Owner info not found");
            Right(HttpResponse::NotFound().json(
                ErrorResponse::new("Owner info not found. For a new installation, an owner must be created before it can be queried.")
            ))
        }
        Err(e) => Left(e),
    }
}

#[put("/owner")]
async fn update(
    session: Session,
    body: web::Json<OwnerInfo>,
    service: web::Data<OwnerService>,
) -> impl Responder {
    match service.update(&session, body.into_inner()).await {
        Ok(v) => {
            debug!("Updated owner info: {:?}", v);
            Right(HttpResponse::Ok().json(v))
        }
        Err(e) => Left(e),
    }
}
