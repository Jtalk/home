use actix_session::Session;
use actix_web::{post, web, HttpResponse, Responder};
use chrono::{Duration, Utc};
use log::{debug, error, warn};
use mockall_double::double;
use uuid;

#[double]
use repo::Repo as RepoImpl;
pub use service::*;

use crate::auth::model::{LoginForm, LoginResponse};
use crate::shared::ErrorResponse;

pub mod config;
pub mod model;
mod password;
mod repo;
mod service;

pub type Repo = RepoImpl;

pub fn configure() -> impl Fn(&mut web::ServiceConfig) -> () {
    move |config: &mut web::ServiceConfig| {
        config.service(login);
    }
}

#[post("/login")]
async fn login(
    body: web::Form<LoginForm>,
    service: web::Data<Service>,
    config: web::Data<config::Config>,
    session: Session,
) -> impl Responder {
    match service.login(&body).await {
        Ok(()) => {
            let expiry_duration: std::time::Duration = config.max_age.clone().into();
            let expiry = Utc::now()
                + Duration::from_std(expiry_duration)
                    .expect("Never configured to overflow session duration");
            debug!(
                "Successful login for {}, session until {}",
                body.login, expiry
            );
            match session.insert(ACCESS_TOKEN_KEY, uuid::Uuid::new_v4().to_string()) {
                Ok(()) => HttpResponse::Ok().json(LoginResponse::success(expiry)),
                Err(e) => e.error_response(),
            }
        }
        Err(LoginError::BadCredentials) => {
            warn!(
                "Login attempt with invalid login/password for '{}'",
                body.login
            );
            HttpResponse::BadRequest().json(LoginResponse::error("Incorrect login/password".into()))
        }
        Err(LoginError::UnsupportedType(t)) => {
            error!(
                "The user '{}' was set up with unsupported authentication type {:?}",
                body.login, t
            );
            HttpResponse::BadRequest().json(LoginResponse::error("Incorrect login/password".into()))
        }
        Err(LoginError::Database(e)) => {
            error!("Error accessing the database in POST /login: {:?}", e);
            HttpResponse::ServiceUnavailable().json(ErrorResponse {
                message: "Database temporarily unavailable".into(),
            })
        }
    }
}
