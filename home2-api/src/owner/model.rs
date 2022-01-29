use std::collections::HashMap;

use chrono::{DateTime, Utc};
use serde::{self, Deserialize, Serialize};
use uuid::Uuid;

use crate::database::oid::ConversionError;
use crate::database::oid::ObjectID;
use crate::database::{HasID, Persisted};

/// We want to know the ID of the owner entry in the database. It makes database code much simpler.
pub const STATIC_OWNER_ID: &str = "owner";

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OwnerInfo {
    pub name: String,
    pub nickname: String,
    pub description: String,
    #[serde(default, skip_serializing_if = "ObjectID::is_empty")]
    pub photo_id: ObjectID,
    pub bio: String,
    pub contacts: HashMap<String, Contact>,
    pub atom_id: Uuid,
    pub updated: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Contact {
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseOwnerInfo {
    pub id: String,
    #[serde(flatten)]
    pub parent: OwnerInfo,
}

impl HasID for DatabaseOwnerInfo {
    fn id(&self) -> String {
        self.id.clone()
    }
}

impl TryFrom<OwnerInfo> for DatabaseOwnerInfo {
    type Error = ConversionError;

    fn try_from(mut parent: OwnerInfo) -> Result<Self, ConversionError> {
        parent.photo_id = parent.photo_id.into_raw("photoId")?;
        Ok(DatabaseOwnerInfo {
            id: STATIC_OWNER_ID.to_string(),
            parent,
        })
    }
}

impl Into<OwnerInfo> for DatabaseOwnerInfo {
    fn into(self) -> OwnerInfo {
        let mut result = self.parent;
        result.photo_id = result.photo_id.into_string();
        result
    }
}

impl Persisted for DatabaseOwnerInfo {
    const COLLECTION: &'static str = "owner";
}
