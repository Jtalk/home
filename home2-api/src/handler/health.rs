use actix_web::{get, web, HttpResponse, Responder};
use serde::{self, Serialize};

use crate::database;

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
pub async fn health() -> impl Responder {
    HttpResponse::Ok().json(HealthStatus::ok())
}

#[get("/ready")]
pub async fn ready(
    db: web::Data<database::Client>,
    db_config: web::Data<database::config::Config>,
) -> impl Responder {
    match db
        .database(&db_config.database)
        .list_collection_names(None)
        .await
    {
        Ok(_) => HttpResponse::Ok().json(HealthStatus::ok()),
        Err(e) => HttpResponse::InternalServerError().json(HealthStatus::error(e)),
    }
}
