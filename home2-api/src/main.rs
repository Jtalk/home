use std::sync::Arc;
use std::{io::Error as IOError, result};

use actix_session::CookieSession;
use actix_web::{App, HttpServer};
use derive_more::From;
use log::LevelFilter;

mod auth;
mod config;
mod database;
mod health;
mod owner;
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

    let db = Arc::new(database().await?);

    let auth_config = config::auth()?;
    let session_key = auth_config.key_binary()?;
    let max_age = auth_config.max_age_actix()?;
    let auth_repo = Arc::new(auth::Repo::new(db.clone()));
    let auth_service = Arc::new(auth::Service::new(auth_repo.clone()));

    HttpServer::new(move || {
        App::new()
            .wrap(CookieSession::private(session_key.clone().as_slice()).max_age_time(max_age))
            .app_data(db.clone())
            .app_data(auth_service.clone())
            .configure(health::configure())
            .configure(owner::configure(db.clone(), auth_service.clone()))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await?;

    Ok(())
}
