use std::{io::Error as IOError, result};

use crate::database::Database;
use actix_web::{web, App, HttpServer};
use derive_more::From;
use log::LevelFilter;

mod config;
mod database;
mod health;
mod owner;
mod shared;

#[cfg(debug_assertions)]
mod dev;

#[derive(Debug, From)]
enum BootstrapError {
    DatabaseConfig(database::config::Error),
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
    HttpServer::new(move || {
        App::new()
            .app_data(db.clone())
            .configure(health::configure())
            .configure(owner::configure(db.clone().into_inner()))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await?;

    Ok(())
}
