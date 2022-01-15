use std::str::FromStr;

use actix_session::Session;
use actix_web::Either::{Left, Right};
use actix_web::{get, rt, web, HttpRequest, HttpResponse, Responder};
use atom_syndication::{Entry, Link, Person};
use chrono::{DateTime, Utc};
use derive_more::From;
use futures::TryFutureExt;
use http::uri::{Authority, Scheme};
use http::Uri;
use itertools::Itertools;
use log::{debug, error};

use crate::blog::Article;
use crate::database::{
    FilterOptions, ListOptions, OrderDirection, OrderOptions, OrderedPaginationOptions,
    PaginationOptions,
};
use crate::owner::OwnerInfo;
use crate::shared::crud::get::{FindError, ListError};
use crate::shared::ErrorResponse;
use crate::{blog, owner};

pub mod config;

const ATOM_MAX_ITEMS: u32 = 20;

pub fn configure() -> impl Fn(&mut web::ServiceConfig) -> () {
    move |config: &mut web::ServiceConfig| {
        config.service(atom);
    }
}

#[get("/atom.xml")]
async fn atom(
    session: Session,
    req: HttpRequest,
    config: web::Data<config::Config>,
    blog_service: web::Data<blog::Service>,
    owner_service: web::Data<owner::Service>,
) -> impl Responder {
    let self_url = self_uri(req);

    let result = fetch_data(&session, blog_service, owner_service)
        .and_then(|(owner, articles)| generate_feed(owner, articles, &self_url, &config))
        .await;
    match result {
        Ok(v) => {
            debug!("Atom feed generation successful");
            Right(
                HttpResponse::Ok()
                    .content_type("application/atom+xml")
                    .insert_header(("Cache-Control", "max-age=3600"))
                    .body(v),
            )
        }
        Err(e) => Left(e),
    }
}

#[derive(Debug, From)]
enum AtomError {
    OwnerError(FindError),
    ArticleError(ListError),
    SerialisationError(atom_syndication::Error),
    RuntimeError(rt::task::JoinError),
    OwnerNotFoundError,
}
type AtomResult<T> = std::result::Result<T, AtomError>;

async fn fetch_data(
    session: &Session,
    blog_service: web::Data<blog::Service>,
    owner_service: web::Data<owner::Service>,
) -> AtomResult<(owner::OwnerInfo, Vec<blog::Article>)> {
    let owner = owner_service
        .find()
        .await?
        .ok_or(AtomError::OwnerNotFoundError)?;

    let list_opts = ListOptions {
        filter: Some(FilterOptions { published: true }),
        pagination: Some(OrderedPaginationOptions {
            order: OrderOptions {
                field: &blog::ArticleFieldName::Created,
                direction: OrderDirection::Desc,
            },
            pagination: Some(PaginationOptions {
                page: 0,
                page_size: ATOM_MAX_ITEMS,
            }),
        }),
    };
    let articles = blog_service.list(session, &list_opts).await?.data;

    Ok((owner, articles))
}

async fn generate_feed(
    owner: OwnerInfo,
    articles: Vec<Article>,
    self_uri: &Uri,
    config: &config::Config,
) -> AtomResult<Vec<u8>> {
    let mut feed = atom_syndication::Feed::default();

    feed.set_title(format!("{}'s Blog", owner.name));
    feed.set_links(vec![link("self", self_uri.to_string())]);
    feed.set_id(format!("urn:uuid:{}", owner.atom_id));
    feed.set_updated(last_updated_at(&owner, &articles).clone());

    let mut author = Person::default();
    author.set_name(owner.name);
    author.set_email(owner.contacts.get("EMAIL").map(|c| c.value.clone()));

    feed.entries = Vec::with_capacity(articles.len());
    for a in articles {
        let mut e = Entry::default();

        let preview = a.preview().map(|v| v.into());

        e.set_title(a.title);
        e.set_links(vec![link(
            "alternate",
            format!("{}/{}", &config.article_url_prefix, a.id),
        )]);
        e.set_id(format!("urn:uuid:{}", a.atom_id));
        e.set_updated(a.updated);
        e.set_summary(preview);
        e.set_authors(vec![author.clone()]);

        feed.entries.push(e);
    }

    // This seems to be taking too long on the main thread
    let output = rt::task::spawn_blocking(move || {
        let mut output: Vec<u8> = Vec::new();
        match feed.write_to(&mut output) {
            Ok(_) => Ok(output),
            Err(e) => Err(e),
        }
    })
    .await??;
    Ok(output)
}

fn link(rel: &str, href: String) -> Link {
    let mut result = Link::default();
    result.rel = rel.to_string();
    result.href = href;
    result
}

fn last_updated_at<'a>(owner: &'a OwnerInfo, articles: &'a Vec<Article>) -> &'a DateTime<Utc> {
    let found = articles
        .iter()
        .map(|a| &a.updated)
        .merge(std::iter::once(&owner.updated))
        .max();
    found.expect("joining with a non-optional owner info must always produce at least one value")
}

fn self_uri(req: HttpRequest) -> Uri {
    if let Some(raw_host) = req.headers().get("Host") {
        if let Ok(host) = raw_host.to_str() {
            if let Ok(authority) = Authority::from_str(host) {
                let mut parts = req.uri().clone().into_parts();
                // The scheme cannot be reliably determined at this point (because of TLS termination).
                // We're forcing HTTPS here because it's 2022 and why not?
                parts.scheme = if host.starts_with("localhost:") {
                    Some(Scheme::HTTP)
                } else {
                    Some(Scheme::HTTPS)
                };
                parts.authority = Some(authority);
                if let Ok(result) = Uri::from_parts(parts) {
                    return result;
                }
            }
        }
    }
    req.uri().clone() // Keep it relative as a fallback
}

impl Responder for AtomError {
    fn respond_to(self, req: &HttpRequest) -> HttpResponse {
        match self {
            Self::OwnerNotFoundError => {
                error!("Atom feed was requested before owner was initialised");
                HttpResponse::InternalServerError().json(ErrorResponse::new(
                    "Owner info must be set up before the Atom feed could be generated",
                ))
            }
            Self::SerialisationError(e) => {
                error!("Error serialising atom feed: {:?}", e);
                HttpResponse::InternalServerError().json(ErrorResponse::new(
                    "Could not serialise the Atom feed into XML",
                ))
            }
            Self::RuntimeError(e) => {
                error!("Error writing atom feed bytes: {:?}", e);
                HttpResponse::InternalServerError().json(ErrorResponse::new(
                    "Internal error trying to serialise the Atom feed into XML",
                ))
            }
            Self::OwnerError(e) => e.respond_to(req),
            Self::ArticleError(e) => e.respond_to(req),
        }
    }
}
