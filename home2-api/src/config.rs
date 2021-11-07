use crate::database as db;

#[cfg(debug_assertions)]
use crate::dev;

#[cfg(debug_assertions)]
pub fn database() -> db::config::Result {
    db::config::Config::from_env_merged(dev::database())
}

#[cfg(not(debug_assertions))]
pub fn database() -> db::config::Result {
    db::config::Config::from_env()
}
