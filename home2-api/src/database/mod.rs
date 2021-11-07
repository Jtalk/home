use std::result;

use mongodb::options::ClientOptions;

pub mod config;

pub type Error = mongodb::error::Error;
pub type Result<T> = result::Result<T, Error>;

type Client = mongodb::Client;
pub struct Database {
    client: Client,
    name: String,
}

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

    fn db(&self) -> mongodb::Database {
        self.client.database(&self.name)
    }
}
