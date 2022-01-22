use merge::Merge;
use serde::de::DeserializeOwned;
use serde::Deserialize;

const CONFIG_PREFIX: &'static str = "ATOM_";

#[derive(Clone, Deserialize)]
pub struct Config {
    pub article_url_prefix: String,
}

#[derive(Clone, Deserialize, Merge)]
pub struct PartialConfig {
    pub article_url_prefix: Option<String>,
}

pub type Error = envy::Error;
pub type Result = std::result::Result<Config, Error>;

impl Config {
    #[allow(dead_code)]
    pub fn from_env() -> Result {
        Config::from_env_for::<Config>()
    }

    #[allow(dead_code)]
    pub fn from_env_merged(defaults: PartialConfig) -> Result {
        let mut partial_env = Config::from_env_for::<PartialConfig>()?;
        partial_env.merge(defaults);

        let article_url_prefix = partial_env
            .article_url_prefix
            .ok_or(Error::MissingValue("article_url_prefix"))?;

        Ok(Config { article_url_prefix })
    }

    fn from_env_for<T>() -> std::result::Result<T, Error>
    where
        T: DeserializeOwned,
    {
        envy::prefixed(CONFIG_PREFIX).from_env::<T>()
    }
}
