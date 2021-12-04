use actix_web::{get, web, HttpResponse, Responder};
use log::error;
use serde::{self, Deserialize, Serialize};

use crate::database;

pub fn configure() -> impl Fn(&mut web::ServiceConfig) {
    |config: &mut web::ServiceConfig| {
        config.service(health).service(ready);
    }
}

#[derive(Serialize, Deserialize)]
struct HealthStatus {
    status: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
}

impl HealthStatus {
    pub fn ok() -> Self {
        HealthStatus {
            status: "Ok".to_owned(),
            message: None,
        }
    }
    pub fn error(e: database::Error) -> Self {
        HealthStatus {
            status: "Error".to_owned(),
            message: Some(format!("Error accessing the database: {:?}", e)),
        }
    }
}

#[get("/health")]
async fn health() -> impl Responder {
    HttpResponse::Ok().json(HealthStatus::ok())
}

#[get("/ready")]
async fn ready(db: web::Data<database::Database>) -> impl Responder {
    match db.health().await {
        Ok(_) => HttpResponse::Ok().json(HealthStatus::ok()),
        Err(e) => {
            error!("Readiness check failed: {:?}", e);
            HttpResponse::ServiceUnavailable().json(HealthStatus::error(e))
        }
    }
}

#[cfg(test)]
mod tests {
    use actix_web::body::AnyBody;
    use actix_web::{test, web, App};
    use http;
    use spectral::prelude::assert_that;

    use crate::database::{self, Database, DatabaseError};
    use crate::shared::testing;

    use super::*;

    #[actix_web::test]
    async fn healthcheck_works() {
        testing::setup_test_logger();

        let app = test::init_service(App::new().configure(configure())).await;
        let req = test::TestRequest::get().uri("/health").to_request();
        let res = test::call_service(&app, req).await;
        assert_eq!(res.status(), http::StatusCode::OK);

        let body = test::read_body_json::<HealthStatus, AnyBody>(res).await;
        assert_eq!(body.status, "Ok");
        assert_eq!(body.message, None);
    }

    #[actix_web::test]
    async fn readiness_works() {
        testing::setup_test_logger();

        let mut db = Database::default();
        db.expect_health().returning(|| Ok(()));

        let app = test::init_service(
            App::new()
                .app_data(web::Data::<database::Database>::new(db))
                .configure(configure()),
        )
        .await;
        let req = test::TestRequest::get().uri("/ready").to_request();
        let res = test::call_service(&app, req).await;
        assert_eq!(res.status(), http::StatusCode::OK);

        let body = test::read_body_json::<HealthStatus, AnyBody>(res).await;
        assert_eq!(body.status, "Ok");
        assert_eq!(body.message, None);
    }

    #[actix_web::test]
    async fn readiness_fails_error_relayed() {
        testing::setup_test_logger();

        let mut db = Database::default();
        db.expect_health().returning(|| {
            Err(DatabaseError::from(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                "Test Error",
            ))
            .into())
        });

        let app = test::init_service(
            App::new()
                .app_data(web::Data::<database::Database>::new(db))
                .configure(configure()),
        )
        .await;
        let req = test::TestRequest::get().uri("/ready").to_request();
        let res = test::call_service(&app, req).await;
        assert_eq!(res.status(), http::StatusCode::SERVICE_UNAVAILABLE);

        let body = test::read_body_json::<HealthStatus, AnyBody>(res).await;
        assert_eq!(body.status, "Error");
        assert!(body
            .message
            .expect("message must be present")
            .contains("Test Error"));
    }
}
