use std::result;

use derive_more::From;
use mockall::automock;
use mongodb::bson::doc;
use mongodb::options::{ClientOptions, ReplaceOptions};
use serde::de::DeserializeOwned;
use serde::Serialize;

use crate::database::config;

pub type DatabaseError = mongodb::error::Error;
#[derive(From, Debug)]
pub enum Error {
    Database(DatabaseError),
    ValueAccessError(mongodb::bson::document::ValueAccessError),
    TransactionError(String),
}
pub type Result<T> = result::Result<T, Error>;
pub type CollectionMetadata = str;

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

    /// Find for single-value collections, like `owner`.
    ///
    /// They use string IDs as opposed to ObjectID.
    pub async fn only<T: 'static>(
        &self,
        collection: &CollectionMetadata,
        id: &str,
    ) -> Result<Option<T>>
    where
        T: DeserializeOwned + Unpin + Send + Sync,
    {
        let col = self.db().collection::<T>(collection);
        let found = col.find_one(Some(doc! { "_id": id }), None).await?;
        Ok(found)
    }

    pub async fn replace<T: 'static>(&self, collection: &CollectionMetadata, data: T) -> Result<T>
    where
        T: DeserializeOwned + Serialize + Unpin + Send + Sync + HasID,
    {
        let id = data.id();
        let col = self.db().collection::<T>(collection);
        col.replace_one(
            doc! { "_id" : id},
            &data,
            Some(ReplaceOptions::builder().upsert(true).build()),
        )
        .await?;
        Ok(data)
    }

    fn db(&self) -> mongodb::Database {
        self.client.database(&self.name)
    }
}

pub trait HasID {
    fn id(&self) -> String;
}
