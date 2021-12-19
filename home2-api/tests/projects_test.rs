use actix_web;
use http::StatusCode;
use rstest::rstest;
use serde_json::{json, Value};
use spectral::assert_that;
use spectral::prelude::*;

use common::url;

mod common;

#[actix_web::test]
async fn fetch_projects() {
    let client = common::client_logged_in().await.unwrap();
    let client_anonymous = common::client().unwrap();

    let mut resp_published = client.get(url("/projects")).send().await.unwrap();
    assert_eq!(resp_published.status(), StatusCode::OK);

    let published = resp_published.json::<Vec<Value>>().await.unwrap();
    assert!(!published.is_empty());

    let mut resp_all = client
        .get(url("/projects?published=false"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp_all.status(), StatusCode::OK);

    let all = resp_all.json::<Vec<Value>>().await.unwrap();
    assert_that!(all.len()).is_greater_than(published.len());

    let mut resp_published_anon = client_anonymous.get(url("/projects")).send().await.unwrap();
    assert_eq!(resp_published_anon.status(), StatusCode::OK);

    let published_anon = resp_published_anon.json::<Vec<Value>>().await.unwrap();
    assert_that!(published_anon.len()).is_greater_than(0);

    let resp_unpublished_anon = client_anonymous
        .get(url("/projects?published=false"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp_unpublished_anon.status(), StatusCode::FORBIDDEN);

    let published_expected = &published[0];
    let unpublished_expected = all
        .iter()
        .find(|p| p["published"] == false)
        .expect("above assersions ensure there's at least one");

    let mut resp_published_one = client_anonymous
        .get(url(format!(
            "/projects/{}",
            published_expected["id"].as_str().unwrap()
        )))
        .send()
        .await
        .unwrap();
    assert_eq!(resp_published_one.status(), StatusCode::OK);
    assert_eq!(
        &resp_published_one.json::<Value>().await.unwrap(),
        published_expected
    );

    let mut resp_unpublished_one = client
        .get(url(format!(
            "/projects/{}",
            unpublished_expected["id"].as_str().unwrap()
        )))
        .send()
        .await
        .unwrap();
    assert_eq!(resp_unpublished_one.status(), StatusCode::OK);
    assert_eq!(
        &resp_unpublished_one.json::<Value>().await.unwrap(),
        unpublished_expected
    );

    let mut resp_unpublished_anon_one = client_anonymous
        .get(url(format!(
            "/projects/{}",
            unpublished_expected["id"].as_str().unwrap()
        )))
        .send()
        .await
        .unwrap();
    assert_eq!(resp_unpublished_anon_one.status(), StatusCode::OK);
    assert_eq!(
        &resp_unpublished_anon_one.json::<Value>().await.unwrap(),
        unpublished_expected
    );
}

#[rstest]
#[case(true)]
#[case(false)]
#[actix_web::test]
async fn fetch_non_existent_project(#[case] authenticated: bool) {
    let client = if authenticated {
        common::client_logged_in().await.unwrap()
    } else {
        common::client().unwrap()
    };

    let resp_nonexistent = client
        .get(url("/projects/nonexistent"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp_nonexistent.status(), StatusCode::NOT_FOUND);
}

#[rstest]
#[case("test-project-it-published-no-links", true, json!([]))]
#[case("test-project-it-unpublished-no-links", false, json!([]))]
#[case("test-project-it-published-one-link", true, json!([{"name": "Home", "href": "https://example.com"}]))]
#[case("test-project-it-unpublished-one-link", false, json!([{"name": "Home", "href": "https://example.com"}]))]
#[case("test-project-it-published-multilink", true, json!([{"name": "Home", "href": "https://example.com"}, {"name": "Source", "href": "https://example.com/source"}]))]
#[case("test-project-it-unpublished-multilink", false, json!([{"name": "Home", "href": "https://example.com"}, {"name": "Source", "href": "https://example.com/source"}]))]
#[actix_web::test]
async fn create_update_delete_project(
    #[case] id: &str,
    #[case] published: bool,
    #[case] links: Value,
) {
    let client = common::client_logged_in().await.unwrap();
    let client_anon = common::client().unwrap();

    let project = json!({
      "id": id,
        "title": "Test project for integration tests",
        "order": 3.0,
        "description": "Just a project",
        "published": published,
        "links": links,
    });
    let mut update_project = project.clone();
    update_project["description"] = json!("Updated project");
    let path = format!("/projects/{}", id);

    let mut create_resp = client.put(url(&path)).send_json(&project).await.unwrap();

    assert_eq!(create_resp.status(), StatusCode::OK);
    let create_body = create_resp.json::<Value>().await.unwrap();
    assert_eq!(create_body, project);

    let mut found_resp = client.get(url(&path)).send().await.unwrap();
    assert_eq!(found_resp.status(), StatusCode::OK);
    let found_body = found_resp.json::<Value>().await.unwrap();
    assert_eq!(found_body, project);

    let mut update_resp = client
        .put(url(&path))
        .send_json(&update_project)
        .await
        .unwrap();
    assert_eq!(update_resp.status(), StatusCode::OK);
    let update_body = update_resp.json::<Value>().await.unwrap();
    assert_eq!(update_body, update_project);

    let delete_anon_resp = client_anon.delete(url(&path)).send().await.unwrap();
    assert_eq!(delete_anon_resp.status(), StatusCode::FORBIDDEN);

    let mut found_again_resp = client.get(url(&path)).send().await.unwrap();
    assert_eq!(found_again_resp.status(), StatusCode::OK);
    let found_again_body = found_again_resp.json::<Value>().await.unwrap();
    assert_eq!(found_again_body, update_project);

    let delete_resp = client.delete(url(&path)).send().await.unwrap();
    assert_eq!(delete_resp.status(), StatusCode::OK);

    let no_longer_found_resp = client.get(url(&path)).send().await.unwrap();
    assert_eq!(no_longer_found_resp.status(), StatusCode::NOT_FOUND);
}

#[actix_web::test]
async fn create_update_project_unauthenticated() {
    let client = common::client().unwrap();

    let project = json!({
      "id": "cannot-create-id",
        "title": "Test project for integration tests",
        "order": 3.0,
        "description": "Just a project",
        "published": false,
        "links": [],
    });

    let create_resp = client
        .put(url("/projects/cannot-create-id"))
        .send_json(&project)
        .await
        .unwrap();

    assert_eq!(create_resp.status(), StatusCode::FORBIDDEN);
}

#[actix_web::test]
async fn delete_project_unauthenticated() {
    let client = common::client().unwrap();

    let delete_resp = client
        .delete(url("/projects/cannot-create-id"))
        .send()
        .await
        .unwrap();

    assert_eq!(delete_resp.status(), StatusCode::FORBIDDEN);
}
