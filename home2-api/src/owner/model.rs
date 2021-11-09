use std::collections::HashMap;

use chrono::{DateTime, Utc};
use serde::{self, Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct OwnerInfo {
    name: String,
    nickname: String,
    description: String,
    #[serde(rename = "photoId")]
    photo_id: String,
    bio: String,
    contacts: HashMap<String, Contact>,
    #[serde(rename = "atomId")]
    atom_id: Uuid,
    updated: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Contact {
    value: String,
}
