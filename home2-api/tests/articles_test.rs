use actix_web;
use http::StatusCode;
use rstest::rstest;
use serde::Deserialize;
use serde_json::{json, Value};
use spectral::assert_that;
use spectral::prelude::*;

use common::url;

mod common;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Pagination {
    pub total: u32,
    pub current: u32,
    pub page_size: u32,
}

#[derive(Debug, Deserialize)]
struct ArticleListResponse {
    pub data: Vec<Value>,
    pub pagination: Pagination,
}

#[actix_web::test]
async fn fetch_articles() {
    let client = common::client_logged_in().await.unwrap();
    let client_anonymous = common::client().unwrap();

    let mut resp_published = client.get(url("/blog/articles")).send().await.unwrap();
    assert_eq!(resp_published.status(), StatusCode::OK);

    let published_wrapper = resp_published.json::<ArticleListResponse>().await.unwrap();
    let published = &published_wrapper.data;
    assert!(!published.is_empty());
    assert_that!(published_wrapper.pagination.total).is_greater_than(0);
    assert_that!(published_wrapper.pagination.current).is_equal_to(0);
    assert_that!(published_wrapper.pagination.page_size).is_greater_than(1);

    let mut resp_published_paginated = client
        .get(url("/blog/articles?page=2&pageSize=2"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp_published_paginated.status(), StatusCode::OK);

    let published_paginated_wrapper = resp_published_paginated
        .json::<ArticleListResponse>()
        .await
        .unwrap();
    let published_paginated = &published_paginated_wrapper.data;
    assert!(!published_paginated.is_empty());
    assert_that!(published_paginated_wrapper.pagination.total).is_greater_than(3);
    assert_that!(published_paginated_wrapper.pagination.current).is_equal_to(2);
    assert_that!(published_paginated_wrapper.pagination.page_size).is_equal_to(2);

    let mut resp_all = client
        .get(url("/blog/articles?published=false"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp_all.status(), StatusCode::OK);

    let all_wrapper = resp_all.json::<ArticleListResponse>().await.unwrap();
    let all = &all_wrapper.data;
    assert_that!(all.len()).is_greater_than_or_equal_to(published.len());
    assert_that!(all_wrapper.pagination.total)
        .is_greater_than_or_equal_to(published_wrapper.pagination.total);
    assert_that!(all_wrapper.pagination.current).is_equal_to(published_wrapper.pagination.current);
    assert_that!(all_wrapper.pagination.page_size)
        .is_equal_to(published_wrapper.pagination.page_size);

    let mut resp_all_paginated = client
        .get(url("/blog/articles?published=false&page=2&pageSize=2"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp_all_paginated.status(), StatusCode::OK);

    let all_paginated_wrapper = resp_all_paginated
        .json::<ArticleListResponse>()
        .await
        .unwrap();
    let all_paginated = &all_paginated_wrapper.data;
    assert_that!(all_paginated.len()).is_equal_to(published_paginated.len());
    assert_that!(all_paginated_wrapper.pagination.total)
        .is_greater_than_or_equal_to(published_paginated_wrapper.pagination.total);
    assert_that!(all_paginated_wrapper.pagination.current)
        .is_equal_to(published_paginated_wrapper.pagination.current);
    assert_that!(all_paginated_wrapper.pagination.page_size)
        .is_equal_to(published_paginated_wrapper.pagination.page_size);

    let mut resp_published_anon = client_anonymous
        .get(url("/blog/articles?page=1&pageSize=3"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp_published_anon.status(), StatusCode::OK);

    let published_anon_wrapper = resp_published_anon
        .json::<ArticleListResponse>()
        .await
        .unwrap();
    let published_anon = &published_anon_wrapper.data;
    assert_that!(published_anon.len()).is_greater_than(0);
    assert_that!(published_anon_wrapper.pagination.total).is_greater_than(0);
    assert_that!(published_anon_wrapper.pagination.current).is_equal_to(1);
    assert_that!(published_anon_wrapper.pagination.page_size).is_equal_to(3);

    let resp_unpublished_anon = client_anonymous
        .get(url("/blog/articles?published=false"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp_unpublished_anon.status(), StatusCode::FORBIDDEN);

    let published_expected = &published[0];
    let unpublished_expected = all
        .iter()
        .find(|p| p["published"] == false)
        .expect("above assertions ensure there's at least one");

    let mut resp_published_one = client_anonymous
        .get(url(format!(
            "/blog/articles/{}",
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
            "/blog/articles/{}",
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
            "/blog/articles/{}",
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

#[actix_web::test]
async fn verify_total_excludes_published() {
    let client = common::client_logged_in().await.unwrap();

    let mut resp_all = client
        .get(url("/blog/articles?published=false&page=0&pageSize=1"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp_all.status(), StatusCode::OK);

    let mut resp_published = client
        .get(url("/blog/articles?published=true&page=0&pageSize=1"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp_published.status(), StatusCode::OK);

    let all_wrapper = resp_all.json::<ArticleListResponse>().await.unwrap();
    let published_wrapper = resp_published.json::<ArticleListResponse>().await.unwrap();
    assert_that!(published_wrapper.pagination.total).is_less_than(all_wrapper.pagination.total);
}

#[rstest]
#[case(true)]
#[case(false)]
#[actix_web::test]
async fn fetch_non_existent_article(#[case] authenticated: bool) {
    let client = if authenticated {
        common::client_logged_in().await.unwrap()
    } else {
        common::client().unwrap()
    };

    let resp_nonexistent = client
        .get(url("/blog/articles/nonexistent"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp_nonexistent.status(), StatusCode::NOT_FOUND);
}

#[rstest]
#[case("test-article-it-published-no-tags", true, json!([]))]
#[case("test-article-it-unpublished-no-tags", false, json!([]))]
#[case("test-article-it-published-one-tags", true, json!(["tag1"]))]
#[case("test-article-it-unpublished-one-tags", false, json!(["tag1"]))]
#[case("test-article-it-published-multitag", true, json!(["tag1", "tag2"]))]
#[case("test-article-it-unpublished-multitag", false, json!(["tag1", "tag2"]))]
#[actix_web::test]
async fn create_update_delete_article(
    #[case] id: &str,
    #[case] published: bool,
    #[case] tags: Value,
) {
    let client = common::client_logged_in().await.unwrap();
    let client_anon = common::client().unwrap();

    let article = json!({
      "id": id,
        "title": "Test article for integration tests",
        "published": published,
        "created": "2021-12-21T13:14:15Z",
        "updated": "2021-12-21T23:14:15Z",
        "content": "# This is a test article\nLet's go!",
        "tags": tags,
        "atomId": uuid::Uuid::new_v4().to_string(),
    });
    let mut update_article = article.clone();
    update_article["title"] = json!("Updated test article for integration tests");
    let path = format!("/blog/articles/{}", id);

    let mut create_resp = client.put(url(&path)).send_json(&article).await.unwrap();

    assert_eq!(create_resp.status(), StatusCode::OK);
    let create_body = create_resp.json::<Value>().await.unwrap();
    assert_eq!(create_body, article);

    let mut found_resp = client.get(url(&path)).send().await.unwrap();
    assert_eq!(found_resp.status(), StatusCode::OK);
    let found_body = found_resp.json::<Value>().await.unwrap();
    assert_eq!(found_body, article);

    let mut update_resp = client
        .put(url(&path))
        .send_json(&update_article)
        .await
        .unwrap();
    assert_eq!(update_resp.status(), StatusCode::OK);
    let update_body = update_resp.json::<Value>().await.unwrap();
    assert_eq!(update_body, update_article);

    let delete_anon_resp = client_anon.delete(url(&path)).send().await.unwrap();
    assert_eq!(delete_anon_resp.status(), StatusCode::FORBIDDEN);

    let mut found_again_resp = client.get(url(&path)).send().await.unwrap();
    assert_eq!(found_again_resp.status(), StatusCode::OK);
    let found_again_body = found_again_resp.json::<Value>().await.unwrap();
    assert_eq!(found_again_body, update_article);

    let delete_resp = client.delete(url(&path)).send().await.unwrap();
    assert_eq!(delete_resp.status(), StatusCode::OK);

    let no_longer_found_resp = client.get(url(&path)).send().await.unwrap();
    assert_eq!(no_longer_found_resp.status(), StatusCode::NOT_FOUND);
}

#[rstest]
#[case(true, json!([]))]
#[case(false, json!([]))]
#[case(true, json!(["tag1"]))]
#[case(false, json!(["tag1"]))]
#[actix_web::test]
async fn create_update_article_unauthenticated(#[case] published: bool, #[case] tags: Value) {
    let client = common::client().unwrap();

    let article = json!({
      "id": "cannot-create-id",
        "title": "Test article for integration tests",
        "published": published,
        "created": "2021-12-21T13:14:15Z",
        "updated": "2021-12-21T23:14:15Z",
        "content": "# This is a test article\nLet's go!",
        "tags": tags,
        "atomId": uuid::Uuid::new_v4().to_string(),
    });

    let create_resp = client
        .put(url("/blog/articles/cannot-create-id"))
        .send_json(&article)
        .await
        .unwrap();

    assert_eq!(create_resp.status(), StatusCode::FORBIDDEN);
}

#[actix_web::test]
async fn delete_article_unauthenticated() {
    let client = common::client().unwrap();

    let delete_resp = client
        .delete(url("/blog/articles/cannot-create-id"))
        .send()
        .await
        .unwrap();

    assert_eq!(delete_resp.status(), StatusCode::FORBIDDEN);
}

#[rstest]
#[case(true)]
#[case(false)]
#[actix_web::test]
async fn fetch_tags(#[case] authenticated: bool) {
    let client = if authenticated {
        common::client_logged_in().await.unwrap()
    } else {
        common::client().unwrap()
    };

    let mut resp_published = client.get(url("/blog/tags")).send().await.unwrap();
    assert_eq!(resp_published.status(), StatusCode::OK);

    let tags = resp_published.json::<Vec<String>>().await.unwrap();
    assert!(!tags.is_empty());
    assert_that!(tags).contains("Scala".to_string());
}
