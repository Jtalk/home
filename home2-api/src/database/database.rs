use std::fmt::Debug;
use std::result;

use convert_case::{Case::Camel, Casing};
use derive_more::From;
use futures::TryStreamExt;
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
pub type CollectionMetadata = str;

#[derive(Debug, Eq, PartialEq)]
pub struct PaginationOptions {
    pub page: u32,
    pub page_size: u32,
}

#[derive(Debug, Eq, PartialEq)]
pub struct OrderedPaginationOptions<T: Sortable> {
    pub pagination: Option<PaginationOptions>,
    pub order: &'static T::Field,
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

type Client = mongodb::Client;

pub struct Database {
    client: Client,
    name: String,
}

#[automock]
impl Database {
    pub async fn new(config: &config::Config) -> Result<Self> {
        let mut options = ClientOptions::parse(&config.connection).await?;
        options.credential = config.to_credentials();
        let client = Client::with_options(options)?;
        Ok(Database {
            client,
            name: config.database.clone(),
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

    pub async fn replace<T: 'static>(&self, collection: &CollectionMetadata, data: T) -> Result<T>
    where
        T: DeserializeOwned + Serialize + Unpin + Send + Sync + HasID,
    {
        let id = data.id();
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
        let name = T::field_name_string(p.order).to_case(Camel);
        result.push(doc! {
            "$sort": { name: 1 }
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
