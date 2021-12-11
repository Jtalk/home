use std::borrow::Borrow;

use actix_web::{post, web, HttpResponse, Responder};
use log::{debug, error};
use mockall_double::double;

#[double]
use repo::Repo as RepoImpl;
pub use service::*;

use crate::auth::model::LoginForm;
use crate::shared::ErrorResponse;

pub mod config;
pub mod model;
mod password;
mod repo;
mod service;

pub type Repo = RepoImpl;

#[post("/login")]
async fn login(body: web::Form<LoginForm>, service: web::Data<Service>) -> impl Responder {
    match service.login(body.borrow()).await {
        Ok(v) => {
            debug!("Successful login for {}", body.login);
            HttpResponse::Ok().json(v)
        }
        Err(e) => {
            error!("Error accessing the database in GET /owner: {:?}", e);
            HttpResponse::ServiceUnavailable().json(ErrorResponse {
                message: "Error accessing the database".into(),
            })
        }
    }
}
