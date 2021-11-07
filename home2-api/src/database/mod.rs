use std::result;

use mongodb::options::ClientOptions;

pub mod config;

pub type Client = mongodb::Client;
pub type Error = mongodb::error::Error;
pub type Result<T> = result::Result<T, Error>;

pub async fn init(config: &config::Config) -> Result<Client> {
    let mut options = ClientOptions::parse(&config.connection).await?;
    options.credential = config.to_credentials();
    Client::with_options(options)
}
