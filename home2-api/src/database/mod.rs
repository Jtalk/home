use mockall_double::double;

#[double]
use database::Database as DatabaseImpl;
pub use database::{Error, Result};

pub mod config;
mod database;

pub type Database = DatabaseImpl;
