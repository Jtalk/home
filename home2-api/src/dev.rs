use crate::database as db;

pub fn database() -> db::config::PartialConfig {
    db::config::PartialConfig {
        connection: Some("mongodb://localhost:27017".to_owned()),
        database: Some("home".to_owned()),
        username: None,
        password: None,
    }
}
