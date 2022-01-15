use std::collections::HashSet;

use actix_web;
use http::StatusCode;
use rstest::rstest;
use serde_json::Value;
use spectral::assert_that;
use spectral::prelude::*;

use common::url;

use crate::common::OWNER_NAME;

mod common;

#[rstest]
#[case(true)]
#[case(false)]
#[actix_web::test]
async fn search(#[case] authenticated: bool) {
    let client = if authenticated {
        common::client_logged_in().await.unwrap()
    } else {
        common::client().unwrap()
    };

    let mut resp = client
        .get(url("/search?q=test&max=10"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);

    let values = resp.json::<Vec<Value>>().await.unwrap();
    assert_that!(values).has_length(10); // There should always be enough in the test database

    let types: HashSet<Option<&str>> = values
        .iter()
        .map(|v| v.get("type").and_then(Value::as_str))
        .collect();
    let expected_types: HashSet<Option<&str>> = [Some("article"), Some("project")].into();
    assert_that!(types).is_equal_to(expected_types);
}

#[rstest]
#[case(true)]
#[case(false)]
#[actix_web::test]
pub async fn search_owner_only(#[case] authenticated: bool) {
    let client = if authenticated {
        common::client_logged_in().await.unwrap()
    } else {
        common::client().unwrap()
    };

    let search_url = format!("/search?q={}&max=10", OWNER_NAME.replace(" ", "+"));
    let mut resp = client.get(url(search_url)).send().await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);

    let values = resp.json::<Vec<Value>>().await.unwrap();
    assert_that!(values).has_length(1);
    assert_that!(values[0].get("type").and_then(Value::as_str))
        .is_some()
        .is_equal_to("owner");
    assert_that!(values[0]
        .get("value")
        .and_then(|v| v.get("name"))
        .and_then(Value::as_str))
    .is_some()
    .is_equal_to(OWNER_NAME);
}
