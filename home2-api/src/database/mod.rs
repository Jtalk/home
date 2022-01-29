use mockall_double::double;

#[double]
use database::Database as DatabaseImpl;
pub use database::*;

pub mod config;
mod database;
pub mod oid;

pub type Database = DatabaseImpl;
