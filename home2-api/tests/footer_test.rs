use actix_web;
use http::StatusCode;
use serde_json::{json, Value};

use common::url;

mod common;

#[actix_web::test]
async fn update_and_fetch_footer() {
    let client = common::client_logged_in().await.unwrap();
    let client_anon = common::client().unwrap();

    let footer = json!({
        "logos": [
            { "name": "Logo 1", "src": "/local-image.svg", "href": "https://example.com/logo-1" },
            { "name": "Superlogo", "src": "https://example.com/image.png" },
            { "name": "Megalogo", "src": "https://example.com/another-image.jpeg", "href": "https://example.com/megalogo" },
        ],
        "links": [
            { "caption": "Source", "href": "https://example.com/source" },
            { "caption": "Documentation", "href": "/docs" }
        ],
    });
    let mut put_resp = client.put(url("/footer")).send_json(&footer).await.unwrap();
    assert_eq!(put_resp.status(), StatusCode::OK);
    assert_eq!(put_resp.json::<Value>().await.unwrap(), footer);

    let put_resp_anon = client_anon
        .put(url("/footer"))
        .send_json(&footer)
        .await
        .unwrap();
    assert_eq!(put_resp_anon.status(), StatusCode::FORBIDDEN);

    let mut resp = client.get(url("/footer")).send().await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    assert_eq!(resp.json::<Value>().await.unwrap(), footer);

    let mut resp_anon = client_anon.get(url("/footer")).send().await.unwrap();
    assert_eq!(resp_anon.status(), StatusCode::OK);
    assert_eq!(resp_anon.json::<Value>().await.unwrap(), footer);
}
