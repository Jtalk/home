use base64ct::Encoding;
use duration_string::DurationString;
use merge::Merge;
use serde::de::DeserializeOwned;
use serde::Deserialize;
use time::Duration as ActixDuration;

const CONFIG_PREFIX: &'static str = "AUTH_";

#[derive(Clone, Deserialize)]
pub struct Config {
    pub key: String,
    pub max_age: DurationString,
}

#[derive(Clone, Deserialize, Merge)]
pub struct PartialConfig {
    pub key: Option<String>,
    pub max_age: Option<DurationString>,
}

pub type Error = envy::Error;
pub type Result = std::result::Result<Config, Error>;

impl Config {
    #[allow(dead_code)]
    pub fn from_env() -> Result {
        Config::from_env_for::<Config>()
    }

    pub fn from_env_merged(defaults: PartialConfig) -> Result {
        let mut partial_env = Config::from_env_for::<PartialConfig>()?;
        partial_env.merge(defaults);

        let key = partial_env.key.ok_or(Error::MissingValue("key"))?;
        let max_age = partial_env.max_age.ok_or(Error::MissingValue("max_age"))?;

        Ok(Config { key, max_age })
    }

    pub fn key_binary(&self) -> std::result::Result<Vec<u8>, Error> {
        base64ct::Base64::decode_vec(&self.key).map_err(|e| {
            let name = format!("{}{}", CONFIG_PREFIX, "key").to_uppercase();
            Error::Custom(format!(
                "Invalid value for {}, must be base64, but: {:?}",
                name, e
            ))
        })
    }

    pub fn max_age_actix(&self) -> std::result::Result<ActixDuration, Error> {
        let std: std::time::Duration = self.max_age.into();
        ActixDuration::try_from(std).map_err(|e| {
            let name = format!("{}{}", CONFIG_PREFIX, "max_age").to_uppercase();
            Error::Custom(format!(
                "Invalid value for {}, must be a positive duration (e.g. 3s, 10m), but: {:?}",
                name, e
            ))
        })
    }

    fn from_env_for<T>() -> std::result::Result<T, Error>
    where
        T: DeserializeOwned,
    {
        envy::prefixed(CONFIG_PREFIX).from_env::<T>()
    }
}
