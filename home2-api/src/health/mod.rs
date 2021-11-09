use actix_web::{get, web, HttpResponse, Responder};
use serde::{self, Serialize};

use crate::database;

pub fn configure() -> impl Fn(&mut web::ServiceConfig) {
    |config: &mut web::ServiceConfig| {
        config.service(health).service(ready);
    }
}

#[derive(Serialize)]
struct HealthStatus {
    status: &'static str,

    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

impl HealthStatus {
    pub fn ok() -> Self {
        HealthStatus {
            status: "Ok",
            message: None,
        }
    }
    pub fn error(e: database::Error) -> Self {
        HealthStatus {
            status: "Error",
            message: Some(format!("Error accessing the database: {:?}", e)),
        }
    }
}

#[get("/health")]
async fn health() -> impl Responder {
    HttpResponse::Ok().json(HealthStatus::ok())
}

#[get("/ready")]
async fn ready(db: web::Data<database::Database>) -> impl Responder {
    match db.health().await {
        Ok(_) => HttpResponse::Ok().json(HealthStatus::ok()),
        Err(e) => HttpResponse::InternalServerError().json(HealthStatus::error(e)),
    }
}
