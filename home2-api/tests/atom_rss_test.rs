use actix_http::HttpMessage;
use actix_web;
use http::StatusCode;
use rstest::rstest;
use spectral::assert_that;

use common::url;

use crate::common::OWNER_NAME;

mod common;

#[rstest]
#[case(true)]
#[case(false)]
#[actix_web::test]
async fn atom_feed(#[case] authenticated: bool) {
    let client = if authenticated {
        common::client_logged_in().await.unwrap()
    } else {
        common::client().unwrap()
    };

    let mut resp = client.get(url("/atom.xml")).send().await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    assert_eq!(resp.content_type(), "application/atom+xml");

    let raw_body: Vec<u8> = resp.body().await.unwrap().to_vec();
    let feed = atom_syndication::Feed::read_from(raw_body.as_slice()).unwrap();

    assert_that!(feed.title.value).is_equal_to(format!("{}'s Blog", OWNER_NAME));
    assert_that!(feed.entries().len()).is_equal_to(20); // Max feed size
}
