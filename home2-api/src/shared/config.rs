use merge::Merge;
use serde::de::DeserializeOwned;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct AppConfig {
    pub cors_origins: Vec<String>,
}

#[derive(Debug, Deserialize, Merge)]
pub struct PartialAppConfig {
    pub cors_origins: Option<Vec<String>>,
}

pub type Error = envy::Error;
pub type Result = std::result::Result<AppConfig, Error>;

impl AppConfig {
    #[allow(dead_code)]
    pub fn from_env() -> Result {
        envy::from_env::<AppConfig>()
    }

    #[allow(dead_code)]
    pub fn from_env_merged(defaults: PartialAppConfig) -> Result {
        let mut partial_env = AppConfig::from_env_for::<PartialAppConfig>()?;
        partial_env.merge(defaults);

        let cors_origins = partial_env
            .cors_origins
            .ok_or(Error::MissingValue("cors_origins"))?;

        Ok(AppConfig { cors_origins })
    }

    fn from_env_for<T>() -> std::result::Result<T, Error>
    where
        T: DeserializeOwned,
    {
        envy::from_env::<T>()
    }
}
