use base64ct::Encoding;
use duration_string::DurationString;
use rand::distributions::Uniform;
use rand::{thread_rng, Rng};

use crate::auth;
use crate::database as db;
use crate::{atom, shared};

pub fn app() -> shared::config::PartialAppConfig {
    shared::config::PartialAppConfig {
        cors_origins: Some(vec!["http://localhost:8070".to_string()]),
    }
}

pub fn database() -> db::config::PartialConfig {
    db::config::PartialConfig {
        connection: Some("mongodb://localhost:27017".to_owned()),
        database: Some("home".to_owned()),
    }
}

pub fn auth() -> auth::config::PartialConfig {
    let uniform = Uniform::new_inclusive(u8::MIN, u8::MAX);

    let key: Vec<u8> = thread_rng().sample_iter(&uniform).take(256).collect();
    let max_age = DurationString::new(std::time::Duration::from_secs(60));

    auth::config::PartialConfig {
        key: Some(base64ct::Base64::encode_string(&key)),
        max_age: Some(max_age),
    }
}

pub fn atom() -> atom::config::PartialConfig {
    atom::config::PartialConfig {
        article_url_prefix: Some("http://localhost:8070/blog/articles".to_string()),
    }
}
