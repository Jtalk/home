use crate::atom;
use crate::auth;
use crate::database as db;
#[cfg(debug_assertions)]
use crate::dev;

#[cfg(debug_assertions)]
pub fn database() -> db::config::Result {
    db::config::Config::from_env_merged(dev::database())
}

#[cfg(debug_assertions)]
pub fn auth() -> auth::config::Result {
    auth::config::Config::from_env_merged(dev::auth())
}

#[cfg(debug_assertions)]
pub fn atom() -> atom::config::Result {
    atom::config::Config::from_env_merged(dev::atom())
}

#[cfg(not(debug_assertions))]
pub fn database() -> db::config::Result {
    db::config::Config::from_env()
}

#[cfg(not(debug_assertions))]
pub fn auth() -> auth::config::Result {
    auth::config::Config::from_env()
}

#[cfg(not(debug_assertions))]
pub fn atom() -> atom::config::Result {
    atom::config::Config::from_env()
}
