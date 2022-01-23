use actix_web::{HttpRequest, HttpResponse, Responder};
use log::error;
use std::fmt::Debug;
use std::result;
use std::str::FromStr;

use convert_case::{Case::Camel, Casing};
use derive_more::From;
use futures::TryStreamExt;
use http::uri::{InvalidUri, PathAndQuery};
use http::Uri;
use mockall::automock;
use mongodb::bson::{doc, from_document, Document};
use mongodb::options::{ClientOptions, ReplaceOptions};
use mongodb::{Collection, Cursor};
use serde::{de::DeserializeOwned, Deserialize, Serialize};

use crate::database::config;

pub type DatabaseError = mongodb::error::Error;
#[derive(From, Debug)]
pub enum Error {
    Database(DatabaseError),
}
pub type Result<T> = result::Result<T, Error>;

#[derive(Debug, From)]
pub enum ParseConnStringError {
    Invalid(InvalidUri),
    NoPath,
    WrongDatabasePath,
}

#[derive(From, Debug)]
pub enum ConnectError {
    Database(DatabaseError),
    Config(ParseConnStringError),
}
pub type ConnectResult<T> = result::Result<T, ConnectError>;

pub type CollectionMetadata = str;

#[derive(Debug, Eq, PartialEq)]
pub struct PaginationOptions {
    pub page: u32,
    pub page_size: u32,
}

#[derive(Debug, Eq, PartialEq)]
pub enum OrderDirection {
    Asc,
    Desc,
}

#[derive(Debug, Eq, PartialEq)]
pub struct OrderOptions<T: Sortable> {
    pub field: &'static T::Field,
    pub direction: OrderDirection,
}

#[derive(Debug, Eq, PartialEq)]
pub struct OrderedPaginationOptions<T: Sortable> {
    pub pagination: Option<PaginationOptions>,
    pub order: OrderOptions<T>,
}

#[derive(Debug, Eq, PartialEq)]
pub struct FilterOptions {
    pub published: bool,
}

#[derive(Debug, Eq, PartialEq, Default)]
pub struct ListOptions<T: Sortable> {
    pub pagination: Option<OrderedPaginationOptions<T>>,
    pub filter: Option<FilterOptions>,
}

pub trait Sortable {
    type Field: 'static + Debug + Eq;

    fn field_name_string(f: &Self::Field) -> &'static str;
}

pub trait Persisted {
    const COLLECTION: &'static str;
}

type Client = mongodb::Client;

pub struct Database {
    client: Client,
    name: String,
}

#[automock]
impl Database {
    pub async fn new(config: &config::Config) -> ConnectResult<Self> {
        let (connection, database) = parse_conn_string(&config.connection)?;
        let options = ClientOptions::parse(&connection).await?;
        let client = Client::with_options(options)?;
        Ok(Database {
            client,
            name: database,
        })
    }

    pub async fn health(&self) -> Result<()> {
        self.db().list_collection_names(None).await?;
        Ok(())
    }

    /// Find a single value in the collection
    ///
    /// They use readable `id` as opposed to ObjectID `_id`.
    pub async fn find<T: 'static>(
        &self,
        collection: &CollectionMetadata,
        id: &str,
    ) -> Result<Option<T>>
    where
        T: DeserializeOwned + Unpin + Send + Sync,
    {
        let col = self.db().collection::<T>(collection);
        let found = col.find_one(Some(doc! { "id": id }), None).await?;
        Ok(found)
    }

    pub async fn list<T: 'static + Sortable>(
        &self,
        collection: &CollectionMetadata,
        options: &ListOptions<T>,
    ) -> Result<(Vec<T>, u64)>
    where
        T: DeserializeOwned + Unpin + Send + Sync,
    {
        let col: Collection<T> = self.db().collection::<T>(collection);
        let aggregation = paginated_list_pipeline(options);
        let found = col.aggregate(aggregation, None).await?;
        paginated_result_extractor(found).await
    }

    pub async fn replace<T: 'static>(
        &self,
        collection: &CollectionMetadata,
        id: &str,
        data: T,
    ) -> Result<T>
    where
        T: DeserializeOwned + Serialize + Unpin + Send + Sync,
    {
        let col = self.db().collection::<T>(collection);
        col.replace_one(
            doc! { "id" : id},
            &data,
            Some(ReplaceOptions::builder().upsert(true).build()),
        )
        .await?;
        Ok(data)
    }

    pub async fn delete(&self, collection: &CollectionMetadata, id: &str) -> Result<u64> {
        let col = self.db().collection::<Document>(collection);
        let result = col.delete_one(doc! { "id": id}, None).await?;
        Ok(result.deleted_count)
    }

    pub fn db(&self) -> mongodb::Database {
        self.client.database(&self.name)
    }
}

pub trait HasID {
    fn id(&self) -> String;
}

fn paginated_list_pipeline<T: Sortable>(
    ListOptions { filter, pagination }: &ListOptions<T>,
) -> Vec<Document> {
    let mut result = Vec::with_capacity(10);
    if let Some(ref f) = filter {
        if f.published {
            result.push(doc! {
             "$match": { "published": true }
            });
        }
    }
    if let Some(ref p) = pagination {
        let name = T::field_name_string(p.order.field).to_case(Camel);
        result.push(doc! {
            "$sort": { name: p.order.direction.mongo_ord() }
        });
        result.push(doc! {
            "$group": { "_id": null, "data": { "$push": "$$ROOT" }, "total": { "$sum": 1 } }
        });
        if let Some(ref pp) = p.pagination {
            let offset = pp.page * pp.page_size;
            let limit = pp.page_size;

            result.push(doc! {
                "$project": { "_id": 0, "total": 1, "data": { "$slice": [ "$data", offset, limit ]}}
            });
        } else {
            result.push(doc! {
                "$project": { "_id": 0, "total": 1, "data": 1 }
            });
        }
    }
    result
}

#[derive(Debug, Deserialize)]
struct PaginatedResultDocument<T> {
    data: Vec<T>,
    total: u64,
}

async fn paginated_result_extractor<T: DeserializeOwned>(
    cursor: Cursor<Document>,
) -> Result<(Vec<T>, u64)> {
    let mut found_vec = cursor.try_collect::<Vec<Document>>().await?;
    if found_vec.is_empty() {
        return Ok((vec![], 0));
    }
    let found_raw = found_vec.remove(0);
    let found: PaginatedResultDocument<T> = from_document(found_raw).map_err(|e| {
        let kind = mongodb::error::ErrorKind::from(e);
        DatabaseError::from(kind)
    })?;
    Ok((found.data, found.total))
}

/// Extract database name from MongoDB connection string.
///
/// The Rust driver would not tell us what database was specified
/// as default in the connection string. We're extracting it
/// manually to make it work with the existing configuration set up
/// built around ReactiveMongo.  
///
fn parse_conn_string(
    connection: &str,
) -> std::result::Result<(String, String), ParseConnStringError> {
    let mut parsed = Uri::from_str(connection)?.into_parts();
    let path = match parsed.path_and_query {
        None => "/",
        Some(ref path_and_q) => path_and_q.path(),
    };
    let split: Vec<&str> = path.splitn(3, '/').collect();
    if split.len() < 2 || split[1].is_empty() {
        return Err(ParseConnStringError::NoPath);
    } else if split.len() > 2 {
        return Err(ParseConnStringError::WrongDatabasePath);
    }
    let database = split[1].to_string();

    parsed.path_and_query = parsed.path_and_query.map(|ref pnq| {
        pnq.query().map_or(PathAndQuery::from_static(""), |q| {
            PathAndQuery::try_from(format!("/?{}", q))
                .expect("Already parsed earlier, should never fail")
        })
    });
    let connection_without_database = Uri::from_parts(parsed)
        .expect("Consist of static and constant parts, should not fail at this point")
        .to_string();

    Ok((connection_without_database, database))
}

impl Responder for Error {
    fn respond_to(self, req: &HttpRequest) -> HttpResponse {
        match self {
            Self::Database(e) => {
                error!("Error accessing database at {}: {:?}", req.uri(), e);
                match e.kind.as_ref() {
                    mongodb::error::ErrorKind::Io(_) => HttpResponse::ServiceUnavailable().finish(),
                    mongodb::error::ErrorKind::ServerSelection { .. } => {
                        HttpResponse::ServiceUnavailable().finish()
                    }
                    mongodb::error::ErrorKind::DnsResolve { .. } => {
                        HttpResponse::ServiceUnavailable().finish()
                    }
                    mongodb::error::ErrorKind::Authentication { .. } => {
                        HttpResponse::ServiceUnavailable().finish()
                    }
                    _ => HttpResponse::InternalServerError().finish(),
                }
            }
        }
    }
}

impl OrderDirection {
    fn mongo_ord(&self) -> i32 {
        match self {
            Self::Asc => 1,
            Self::Desc => -1,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    use rstest::rstest;
    use spectral::{assert_that, prelude::*};

    #[rstest]
    #[case("mongodb://example.com/database", Some(("mongodb://example.com/", "database")))]
    #[case("mongodb://host.example.com/database", Some(("mongodb://host.example.com/", "database")))]
    #[case("mongodb://user:password@host.example.com/database", Some(("mongodb://user:password@host.example.com/", "database")))]
    #[case("mongodb+srv://host.example.com/database", Some(("mongodb+srv://host.example.com/", "database")))]
    #[case("mongodb+srv://user:password@host.example.com/database", Some(("mongodb+srv://user:password@host.example.com/", "database")))]
    #[case("mongodb://example.com/database?query=1&param=value", Some(("mongodb://example.com/?query=1&param=value", "database")))]
    #[case("mongodb://host.example.com/database?query=1&param=value", Some(("mongodb://host.example.com/?query=1&param=value", "database")))]
    #[case("mongodb://user:password@host.example.com/database?query=1&param=value", Some(("mongodb://user:password@host.example.com/?query=1&param=value", "database")))]
    #[case("mongodb+srv://host.example.com/database?query=1&param=value", Some(("mongodb+srv://host.example.com/?query=1&param=value", "database")))]
    #[case("mongodb+srv://user:password@host.example.com/database?query=1&param=value", Some(("mongodb+srv://user:password@host.example.com/?query=1&param=value", "database")))]
    #[case("example.com/database", None)]
    #[case("mongodb://example.com/", None)]
    #[case("mongodb://example.com", None)]
    #[case("mongodb://example.com/database/other", None)]
    #[case("mongodb://example.com/?query=1&param=value", None)]
    #[case("mongodb://example.com?query=1&param=value", None)]
    #[case("mongodb://example.com/database/other?query=1&param=value", None)]
    #[test]
    fn parse_conn_string_test(#[case] source: &str, #[case] expected: Option<(&str, &str)>) {
        let result = parse_conn_string(source);
        match expected {
            Some((conn, db)) => assert_that!(result)
                .is_ok()
                .is_equal_to((conn.to_string(), db.to_string())),
            None => {
                assert_that!(result).is_err();
            }
        }
    }
}
