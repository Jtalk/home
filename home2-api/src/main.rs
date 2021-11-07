use std::{io::Error as IOError, result};

use actix_web::{web, App, HttpServer};
use derive_more::From;

mod config;
mod database;
mod handler;

#[cfg(debug_assertions)]
mod dev;

#[derive(Debug, From)]
enum BootstrapError {
    DatabaseConfig(database::config::Error),
    Database(database::Error),
    Server(IOError),
}

type BootstrapResult = result::Result<(), BootstrapError>;

async fn database() -> result::Result<database::Database, BootstrapError> {
    let config = config::database()?;
    let result = database::Database::new(&config).await?;
    Ok(result)
}

#[actix_web::main]
async fn main() -> BootstrapResult {
    let db = web::Data::new(database().await?);
    HttpServer::new(move || {
        App::new()
            .app_data(db.clone())
            .service(handler::health)
            .service(handler::ready)
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await?;

    BootstrapResult::Ok(())
}
