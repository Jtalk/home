use std::result;

use merge::Merge;
use mongodb::options::Credential;
use serde::de::DeserializeOwned;
use serde::Deserialize;

const CONFIG_PREFIX: &'static str = "DATABASE_";

#[derive(Clone, Deserialize)]
pub struct Config {
    pub connection: String,
    pub database: String,
    pub username: Option<String>,
    pub password: Option<String>,
}

#[derive(Deserialize, Merge)]
pub struct PartialConfig {
    pub connection: Option<String>,
    pub database: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
}

pub type Error = envy::Error;
pub type Result = result::Result<Config, Error>;

impl Config {
    #[allow(dead_code)]
    pub fn from_env() -> Result {
        Config::from_env_for::<Config>()
    }

    pub fn from_env_merged(defaults: PartialConfig) -> Result {
        let mut partial_env = Config::from_env_for::<PartialConfig>()?;
        partial_env.merge(defaults);
        let connection = partial_env
            .connection
            .ok_or(Error::MissingValue("connection"))?;
        let database = partial_env
            .database
            .ok_or(Error::MissingValue("database"))?;
        let username = partial_env.username;
        let password = partial_env.password;
        Ok(Config {
            connection,
            database,
            username,
            password,
        })
    }

    fn from_env_for<T>() -> result::Result<T, Error>
    where
        T: DeserializeOwned,
    {
        envy::prefixed(CONFIG_PREFIX).from_env::<T>()
    }

    pub fn to_credentials_move(self) -> Option<Credential> {
        if self.username.is_none() && self.password.is_none() {
            return None;
        }
        let mut result = Credential::default();
        result.username = self.username;
        result.password = self.password;
        Some(result)
    }

    pub fn to_credentials(&self) -> Option<Credential> {
        let clone = self.clone();
        clone.to_credentials_move()
    }
}
