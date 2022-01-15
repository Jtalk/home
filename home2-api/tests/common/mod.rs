use std::error::Error;
use std::fmt::Debug;

use awc::http::{StatusCode, Uri};
use awc::Client;
use envy;
use serde::{self, Deserialize};
use serde_json::json;
use simple_error::SimpleError;
use tokio::sync::OnceCell;

pub const SESSION_COOKIE_NAME: &str = "api-session";
static SESSION_COOKIE: OnceCell<String> = OnceCell::const_new();

pub const OWNER_NAME: &str = "Gull Birdsson";

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

pub type ClientResult = Result<Client, Box<dyn Error>>;
pub fn client() -> ClientResult {
    Ok(Client::default())
}

pub fn client_with_session(session_cookie: &str) -> Client {
    Client::builder()
        .header(
            "Cookie",
            format!("{}={}", SESSION_COOKIE_NAME, session_cookie),
        )
        .finish()
}

#[allow(dead_code)]
pub async fn client_logged_in() -> ClientResult {
    let session_cookie = SESSION_COOKIE.get_or_try_init(fetch_auth_cookie).await?;
    Ok(client_with_session(session_cookie))
}

async fn fetch_auth_cookie() -> Result<String, Box<dyn Error>> {
    let login_client = client()?;

    let form = json!({
        "login": "admin",
        "password": "password",
    });
    let resp = login_client.post(url("/login")).send_form(&form).await?;

    assert_eq!(StatusCode::OK, resp.status());
    let cookie = resp.cookie(SESSION_COOKIE_NAME).ok_or(SimpleError::new(
        "session cookie not found in server response",
    ))?;

    Ok(cookie.value().to_string())
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
