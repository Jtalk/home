use actix_web;
use chrono::prelude::*;
use http::StatusCode;
use serde_json::{json, Value};

use crate::common::url;

mod common;

#[actix_web::test]
async fn login_success() {
    let client = common::client().unwrap();
    let now = Utc::now();

    let form = json!({
        "login": "admin",
        "password": "password",
    });

    let mut resp = client.post(url("/login")).send_form(&form).await.unwrap();

    assert_eq!(StatusCode::OK, resp.status());

    let auth_cookie = resp.cookie(common::AUTH_COOKIE_NAME);
    assert!(auth_cookie.is_some());

    let body = resp.json::<Value>().await.unwrap();
    let status = body.get("status").unwrap().as_str().unwrap();
    let expiry = DateTime::parse_from_rfc3339(body.get("expiry").unwrap().as_str().unwrap())
        .unwrap()
        .with_timezone(&Utc);

    assert_eq!("ok", status);
    assert!(expiry > now);
}
