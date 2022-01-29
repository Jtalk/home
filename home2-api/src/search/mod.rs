use std::sync::Arc;

use actix_web::Either::{Left, Right};
use actix_web::{get, web, HttpResponse, Responder};
use log::debug;
use serde::Deserialize;

use repo::Repo;
use service::Service;

use crate::database::Database;

mod model;
mod repo;
mod service;

pub fn configure(db: Arc<Database>) -> impl Fn(&mut web::ServiceConfig) -> () {
    let service = web::Data::new(Service::new(Arc::new(Repo::new(db))));
    move |config: &mut web::ServiceConfig| {
        config.app_data(service.clone()).service(search);
    }
}

#[derive(Debug, Deserialize)]
struct SearchQuery {
    q: String,
    #[serde(default = "search_max_default")]
    max: u32,
}

#[get("/search")]
async fn search(query: web::Query<SearchQuery>, service: web::Data<Service>) -> impl Responder {
    match service.search(&query.q, query.max).await {
        Ok(v) => {
            debug!("Search successful for {}", &query.q);
            Right(HttpResponse::Ok().json(v))
        }
        Err(e) => Left(e),
    }
}

fn search_max_default() -> u32 {
    20
}
