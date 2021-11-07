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

async fn database() -> result::Result<(database::Client, database::config::Config), BootstrapError>
{
    let config = config::database()?;
    let database = database::init(&config).await?;
    Ok((database, config))
}

#[actix_web::main]
async fn main() -> BootstrapResult {
    let (database, mut database_config) = database().await?;
    database_config.redact();

    let db_state = web::Data::new(database);
    let db_config_state = web::Data::new(database_config);
    HttpServer::new(move || {
        App::new()
            .app_data(db_state.clone())
            .app_data(db_config_state.clone())
            .service(handler::health)
            .service(handler::ready)
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await?;

    BootstrapResult::Ok(())
}
