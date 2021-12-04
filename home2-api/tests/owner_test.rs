use actix_web;
use http::StatusCode;
use serde_json::{json, Value};

use crate::common::url;

mod common;

#[actix_web::test]
async fn update_and_fetch_owner_without_photo() {
    let client = common::client().unwrap();
    let owner = json!({
        "name": "Gull McBirdsson",
        "nickname": "gull",
        "description": "Cool Bird",
        "bio": "Test Bio\nTest",
        "contacts": { "EMAIL": { "value": "test@example.com" } },
        "atomId": "e4435f7d-3c38-44c6-8e0e-b72864fe91bb",
        "updated": "2021-12-11T13:14:15Z",
    });
    let put_resp = client.put(url("/owner")).send_json(&owner).await.unwrap();
    assert_eq!(put_resp.status(), StatusCode::OK);
}

#[actix_web::test]
async fn update_and_fetch_owner() {
    let client = common::client().unwrap();
    let owner = json!({
        "name": "Gull McBirdsson",
        "nickname": "gull",
        "description": "Cool Bird",
        "bio": "Test Bio\nTest",
        "photoId": "61aba651e6c10977e2265a8b",
        "contacts": { "EMAIL": { "value": "test@example.com" } },
        "atomId": "e4435f7d-3c38-44c6-8e0e-b72864fe91bb",
        "updated": "2021-12-11T13:14:15Z",
    });
    let mut put_resp = client.put(url("/owner")).send_json(&owner).await.unwrap();
    assert_eq!(put_resp.status(), StatusCode::OK);
    assert_eq!(put_resp.json::<Value>().await.unwrap(), owner);

    let mut resp = client.get(url("/owner")).send().await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    assert_eq!(resp.json::<Value>().await.unwrap(), owner);
}
