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
        config.service(login).service(refresh).service(logout);
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
            debug!("Creating session for {}", body.login);
            update_session(&config, &session)
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
        Err(LoginError::ActixRuntimeError(e)) => {
            error!("Error running password hashing in POST /login: {:?}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                message: "Internal error".into(),
            })
        }
    }
}

#[post("/login/refresh")]
async fn refresh(
    service: web::Data<Service>,
    config: web::Data<config::Config>,
    session: Session,
) -> impl Responder {
    match service.verify(&session) {
        Ok(()) => {
            debug!("Refreshing session");
            update_session(&config, &session)
        }
        Err(VerifyError::BadAuthentication(msg)) => {
            warn!("Refresh attempt while unauthenticated: {}", msg);
            HttpResponse::BadRequest().json(LoginResponse::error("Session expired".into()))
        }
        Err(VerifyError::Other(e)) => {
            error!("Error refreshing session: {:?}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                message: "Unknown error".into(),
            })
        }
    }
}

#[post("/logout")]
async fn logout(session: Session) -> impl Responder {
    session.remove(ACCESS_TOKEN_KEY);
    HttpResponse::Ok()
}

fn update_session(config: &config::Config, session: &Session) -> HttpResponse {
    let expiry_duration: std::time::Duration = config.max_age.clone().into();
    let expiry = Utc::now()
        + Duration::from_std(expiry_duration)
            .expect("Never configured to overflow session duration");
    if let Err(e) = session.insert(ACCESS_TOKEN_KEY, uuid::Uuid::new_v4().to_string()) {
        return e.error_response();
    }
    if let Err(e) = session.insert(ACCESS_TOKEN_EXPIRY_KEY, expiry) {
        return e.error_response();
    }
    HttpResponse::Ok().json(LoginResponse::success(expiry))
}
