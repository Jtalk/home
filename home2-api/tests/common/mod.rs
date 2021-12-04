use std::fmt::Debug;

use awc::http::Uri;
use awc::Client;
use envy;
use serde::{self, Deserialize};

pub fn url<'a, U>(path: U) -> Uri
where
    Uri: TryFrom<&'a str> + TryFrom<U>,
    <Uri as TryFrom<U>>::Error: Debug,
{
    let mut requested = Uri::try_from(path).unwrap().into_parts();
    let configured_base = Uri::try_from(&config().base_url).unwrap().into_parts();
    requested.authority = configured_base.authority;
    requested.scheme = configured_base.scheme;
    Uri::from_parts(requested).unwrap()
}

pub type ClientResult = Result<Client, std::io::Error>;
pub fn client() -> ClientResult {
    Ok(Client::default())
}

#[derive(Debug, Deserialize)]
struct TestConfig {
    #[serde(default = "default_base_path")]
    base_url: String,
}
fn default_base_path() -> String {
    "http://localhost:8080".into()
}
fn config() -> TestConfig {
    envy::prefixed("TEST_").from_env::<TestConfig>().unwrap()
}
