use std::sync::Arc;

use actix_session::Session;
use actix_web::Either::{Left, Right};
use actix_web::{get, put, web, HttpResponse, Responder};
use log::{debug, warn};

use model::Footer;
use service::Service;

use crate::auth;
use crate::database::Database;
use crate::shared::ErrorResponse;

mod model;
mod service;

pub fn configure(
    db: Arc<Database>,
    auth_service: Arc<auth::Service>,
) -> impl Fn(&mut web::ServiceConfig) -> () {
    let service = web::Data::new(Service::new(db, auth_service));
    move |config: &mut web::ServiceConfig| {
        config
            .app_data(service.clone())
            .service(find)
            .service(update);
    }
}

#[get("/footer")]
async fn find(service: web::Data<Service>) -> impl Responder {
    match service.find().await {
        Ok(Some(v)) => {
            debug!("Footer info");
            Right(HttpResponse::Ok().json(v))
        }
        Ok(None) => {
            warn!("Footer not found");
            Right(HttpResponse::NotFound().json(ErrorResponse::new("Footer not found")))
        }
        Err(e) => Left(e),
    }
}

#[put("/footer")]
async fn update(
    session: Session,
    body: web::Json<Footer>,
    service: web::Data<Service>,
) -> impl Responder {
    match service.update(&session, body.into_inner()).await {
        Ok(v) => {
            debug!("Updated footer: {:?}", v);
            Right(HttpResponse::Ok().json(v))
        }
        Err(e) => Left(e),
    }
}
