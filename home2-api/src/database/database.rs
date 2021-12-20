use std::fmt::Debug;
use std::result;

use convert_case::{Case::Camel, Casing};
use derive_more::From;
use futures::TryStreamExt;
use mockall::automock;
use mongodb::bson::{doc, Document};
use mongodb::options::{ClientOptions, FindOptions, ReplaceOptions};
use mongodb::Collection;
use serde::de::DeserializeOwned;
use serde::Serialize;

use crate::database::config;

pub type DatabaseError = mongodb::error::Error;
#[derive(From, Debug)]
pub enum Error {
    Database(DatabaseError),
    ValueAccessError(mongodb::bson::document::ValueAccessError),
}
pub type Result<T> = result::Result<T, Error>;
pub type CollectionMetadata = str;

#[derive(Debug, Eq, PartialEq)]
pub struct PaginationOptions<T: Sortable> {
    pub page: u32,
    pub page_size: u32,
    pub order: &'static T::Field,
}

#[derive(Debug, Eq, PartialEq)]
pub struct FilterOptions {
    pub published: bool,
}

#[derive(Debug, Eq, PartialEq, Default)]
pub struct ListOptions<T: Sortable> {
    pub pagination: Option<PaginationOptions<T>>,
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
    ) -> Result<Vec<T>>
    where
        T: DeserializeOwned + Unpin + Send + Sync,
    {
        let ListOptions { pagination, filter } = options;
        let db_filter = filter
            .as_ref()
            .filter(|v| v.published)
            .map(|_| doc! { "published": true });
        let db_options = pagination.as_ref().map(|o| {
            let field_name = T::field_name_string(o.order).to_case(Camel);
            FindOptions::builder()
                .skip(Some(o.page as u64 * o.page_size as u64))
                .limit(Some(o.page_size as i64))
                .sort(Some(doc! { field_name: 1 }))
                .build()
        });

        let col: Collection<T> = self.db().collection::<T>(collection);
        let found = col.find(db_filter, db_options).await?;
        let result: Vec<T> = found.try_collect::<Vec<T>>().await?;
        Ok(result)
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
