use std::{io::Error as IOError, result};

use actix_session::CookieSession;
use actix_web::{web, App, HttpServer};
use derive_more::From;
use log::LevelFilter;

mod auth;
mod config;
mod database;
mod health;
mod owner;
mod projects;
mod shared;

#[cfg(debug_assertions)]
mod dev;

#[derive(Debug, From)]
enum BootstrapError {
    Config(envy::Error),
    Database(database::Error),
    Server(IOError),
    Logger(log::SetLoggerError),
}

type BootstrapResult = result::Result<(), BootstrapError>;

async fn database() -> result::Result<database::Database, BootstrapError> {
    let config = config::database()?;
    let result = database::Database::new(&config).await?;
    Ok(result)
}

#[actix_web::main]
async fn main() -> BootstrapResult {
    simplelog::SimpleLogger::init(LevelFilter::Debug, simplelog::Config::default())?;

    let db = web::Data::new(database().await?);

    let auth_config = web::Data::new(config::auth()?);
    let session_key = auth_config.key_binary()?;
    let max_age = auth_config.max_age_actix()?;
    let auth_repo = web::Data::new(auth::Repo::new(db.clone().into_inner()));
    let auth_service = web::Data::new(auth::Service::new(auth_repo.clone().into_inner()));

    HttpServer::new(move || {
        App::new()
            .wrap(
                CookieSession::private(session_key.clone().as_slice())
                    .max_age_time(max_age)
                    .name("api-session"),
            )
            .app_data(db.clone())
            .app_data(auth_service.clone())
            .app_data(auth_config.clone())
            .configure(health::configure())
            .configure(auth::configure())
            .configure(owner::configure(
                db.clone().into_inner(),
                auth_service.clone().into_inner(),
            ))
            .configure(projects::configure(
                db.clone().into_inner(),
                auth_service.clone().into_inner(),
            ))
    })
    .worker_max_blocking_threads(1) // We don't block in those, we run PBKDF2 :(
    .bind("0.0.0.0:8080")?
    .run()
    .await?;

    Ok(())
}
