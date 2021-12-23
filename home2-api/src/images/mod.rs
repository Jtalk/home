use std::convert::Infallible;
use std::sync::Arc;

use actix_multipart::{Multipart, MultipartError};
use actix_session::Session;
use actix_web::Either::{Left, Right};
use actix_web::{delete, get, post, web, HttpRequest, HttpResponse, Responder};
use derive_more::From;
use futures::{StreamExt, TryStreamExt};
use log::{debug, error, warn};
use serde::Deserialize;

use repo::Repo;
use service::Service;

use crate::auth;
use crate::database::Database;
use crate::images::model::ImageFile;
use crate::shared::ErrorResponse;

mod model;
mod repo;
mod service;

const IMAGE_PAGE_SIZE: u32 = 10;

#[derive(Debug, From)]
enum UploadError {
    Service(service::UploadError),
    Multipart(MultipartError),
    TooManyFiles,
    TooFewFiles,
}
type UploadResult = std::result::Result<ImageFile, UploadError>;

pub fn configure(
    db: Arc<Database>,
    auth_service: Arc<auth::Service>,
) -> impl Fn(&mut web::ServiceConfig) -> () {
    let service = web::Data::new(Service::new(
        Arc::new(Repo::new(db.clone())),
        db.clone(),
        auth_service,
    ));
    move |config: &mut web::ServiceConfig| {
        config
            .app_data(service.clone())
            .service(list)
            .service(serve)
            .service(upload)
            .service(delete);
    }
}

#[derive(Debug, Deserialize)]
struct ListQuery {
    page: u32,
}

#[derive(Debug, Deserialize)]
struct UploadQuery {
    description: String,
}

#[get("/images")]
async fn list(
    q: web::Query<ListQuery>,
    session: Session,
    service: web::Data<Service>,
) -> impl Responder {
    match service.list(&session, q.page, IMAGE_PAGE_SIZE).await {
        Ok(v) => Right(HttpResponse::Ok().json(v)),
        Err(e) => Left(e),
    }
}

#[get("/images/{id}")]
async fn serve(id: web::Path<String>, service: web::Data<Service>) -> impl Responder {
    match service.serve(&id).await {
        Ok(Some(ostream)) => {
            Right(HttpResponse::Ok().streaming(ostream.map(
                |v| -> std::result::Result<web::Bytes, Infallible> { Ok(web::Bytes::from(v)) },
            )))
        }
        Ok(None) => Right(HttpResponse::NotFound().finish()),
        Err(e) => Left(e),
    }
}

#[delete("/images/{id}")]
async fn delete(
    id: web::Path<String>,
    session: Session,
    service: web::Data<Service>,
) -> impl Responder {
    match service.delete(&session, &id).await {
        Ok(true) => {
            debug!("Image deleted: {}", id);
            Right(HttpResponse::Ok().finish())
        }
        Ok(false) => {
            warn!("Image {} not found when deleting", id);
            Right(HttpResponse::NotFound().finish())
        }
        Err(e) => Left(e),
    }
}

#[post("/images")]
async fn upload(
    q: web::Query<UploadQuery>,
    payload: Multipart,
    session: Session,
    service: web::Data<Service>,
) -> impl Responder {
    match process_upload(&q, &session, &service, payload).await {
        Ok(v) => Right(HttpResponse::Ok().json(v)),
        Err(e) => Left(e),
    }
}

async fn process_upload(
    q: &UploadQuery,
    session: &Session,
    service: &Service,
    mut payload: Multipart,
) -> UploadResult {
    let result = if let Some(file) = payload.try_next().await? {
        let cd = file.content_disposition();
        let name = cd
            .get_filename()
            .map_or_else(|| uuid::Uuid::new_v4().to_string(), ToString::to_string);

        // We need to make our multipart stream compatible with AsyncRead, which only supports
        // io::Errors.
        let istream = file.map_err(|e| {
            error!("Error during multipart upload: {:?}", e);
            std::io::Error::new(std::io::ErrorKind::Other, "unknown error")
        });

        let result = service
            .upload(&session, &name, &q.description, istream.into_async_read())
            .await?;
        Ok(result)
    } else {
        Err(UploadError::TooFewFiles)
    };
    if let Some(_) = payload.try_next().await? {
        Err(UploadError::TooManyFiles)
    } else {
        result
    }
}

impl Responder for UploadError {
    fn respond_to(self, req: &HttpRequest) -> HttpResponse {
        match self {
            Self::Multipart(e) => {
                let message = format!("{}", e);
                HttpResponse::BadRequest().json(ErrorResponse::new(message))
            }
            Self::Service(e) => e.respond_to(req),
            Self::TooManyFiles => {
                warn!(
                    "Invalid file upload at {}: too many files, only one file can be uploaded at a time", req.uri()
                );
                HttpResponse::BadRequest().json(ErrorResponse::new(
                    "Only one file can be uploaded at a time",
                ))
            }
            Self::TooFewFiles => {
                warn!(
                    "Invalid file upload at {}: no files were provided in a multipart file upload",
                    req.uri()
                );
                HttpResponse::BadRequest().json(ErrorResponse::new(
                    "No file was provided with multipart upload",
                ))
            }
        }
    }
}
