use actix_web;
use chrono::prelude::*;
use http::StatusCode;
use serde_json::{json, Value};

use crate::common::url;
use rstest::rstest;

mod common;

#[actix_web::test]
async fn login_refresh_logout() {
    let client = common::client().unwrap();
    let now = Utc::now();

    let form = json!({
        "login": "admin",
        "password": "password",
    });

    let mut resp = client.post(url("/login")).send_form(&form).await.unwrap();

    assert_eq!(StatusCode::OK, resp.status());

    let auth_cookie = resp.cookie(common::SESSION_COOKIE_NAME);
    assert!(auth_cookie.is_some());

    let body = resp.json::<Value>().await.unwrap();
    let status = body.get("status").unwrap().as_str().unwrap();
    let expiry = DateTime::parse_from_rfc3339(body.get("expiry").unwrap().as_str().unwrap())
        .unwrap()
        .with_timezone(&Utc);

    assert_eq!("ok", status);
    assert!(expiry > now);

    let auth_client = common::client_with(&auth_cookie.unwrap());
    let mut refresh_resp = auth_client
        .post(url("/login/refresh"))
        .send()
        .await
        .unwrap();

    assert_eq!(StatusCode::OK, refresh_resp.status());

    let refresh_body = refresh_resp.json::<Value>().await.unwrap();
    let refresh_status = refresh_body.get("status").unwrap().as_str().unwrap();
    let refresh_expiry =
        DateTime::parse_from_rfc3339(refresh_body.get("expiry").unwrap().as_str().unwrap())
            .unwrap()
            .with_timezone(&Utc);

    assert_eq!("ok", refresh_status);
    assert!(refresh_expiry > now);

    let logout_resp = auth_client.post(url("/logout")).send().await.unwrap();

    assert_eq!(StatusCode::OK, logout_resp.status());

    let logout_cookie = logout_resp.cookie(common::SESSION_COOKIE_NAME).unwrap();
    let logout_client = common::client_with(&logout_cookie);

    let should_fail_resp = logout_client
        .post(url("/login/refresh"))
        .send()
        .await
        .unwrap();

    assert_eq!(StatusCode::BAD_REQUEST, should_fail_resp.status());
}

#[rstest]
#[case("admin", "wrong-password")]
#[case("not-admin", "password")]
#[case("not-admin", "wrong-password")]
#[actix_web::test]
async fn login_wrong_password(#[case] login: &str, #[case] password: &str) {
    let client = common::client().unwrap();

    let form = json!({
        "login": login,
        "password": password,
    });

    let mut resp = client.post(url("/login")).send_form(&form).await.unwrap();

    assert_eq!(StatusCode::BAD_REQUEST, resp.status());

    let auth_cookie = resp
        .cookie(common::SESSION_COOKIE_NAME)
        .expect("session created anyway");
    let auth_client = common::client_with(&auth_cookie);

    let body = resp.json::<Value>().await.unwrap();
    let status = body.get("status").unwrap().as_str().unwrap();
    let error = body.get("error").unwrap().as_str().unwrap();

    assert_eq!("error", status);
    assert_eq!("Incorrect login/password", error);

    let refresh_resp = auth_client
        .post(url("/login/refresh"))
        .send()
        .await
        .unwrap();
    assert_eq!(StatusCode::BAD_REQUEST, refresh_resp.status());
}
