use std::result;

use merge::Merge;
use serde::de::DeserializeOwned;
use serde::Deserialize;

const CONFIG_PREFIX: &str = "DATABASE_";

#[derive(Clone, Deserialize)]
pub struct Config {
    pub connection: String,
}

#[derive(Deserialize, Merge)]
pub struct PartialConfig {
    pub connection: Option<String>,
}

pub type Error = envy::Error;
pub type Result = result::Result<Config, Error>;

impl Config {
    #[allow(dead_code)]
    pub fn from_env() -> Result {
        Config::from_env_for::<Config>()
    }

    #[allow(dead_code)]
    pub fn from_env_merged(defaults: PartialConfig) -> Result {
        let mut partial_env = Config::from_env_for::<PartialConfig>()?;
        partial_env.merge(defaults);
        let connection = partial_env
            .connection
            .ok_or(Error::MissingValue("connection"))?;
        Ok(Config { connection })
    }

    fn from_env_for<T>() -> result::Result<T, Error>
    where
        T: DeserializeOwned,
    {
        envy::prefixed(CONFIG_PREFIX).from_env::<T>()
    }
}
