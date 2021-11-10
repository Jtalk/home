use std::result;

use crate::database::config;
use mockall::automock;
use mongodb::options::{ClientOptions, FindOneOptions};
use serde::de::DeserializeOwned;

pub type Error = mongodb::error::Error;
pub type Result<T> = result::Result<T, Error>;

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

    pub async fn only<T: 'static>(&self, collection: &'static str) -> Result<Option<T>>
    where
        T: DeserializeOwned + Unpin + Send + Sync,
    {
        let col = self.db().collection::<T>(collection);
        let opts = FindOneOptions::builder().build();
        col.find_one(None, Some(opts)).await
    }

    fn db(&self) -> mongodb::Database {
        self.client.database(&self.name)
    }
}
