use serde::{Deserialize, Serialize};

use crate::database::oid::ConversionError;
use crate::database::{HasID, Persisted};

/// We want to know the ID of the owner entry in the database. It makes database code much simpler.
pub const STATIC_FOOTER_ID: &str = "footer";

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Footer {
    pub logos: Vec<Logo>,
    pub links: Vec<Link>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Link {
    caption: String,
    href: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Logo {
    name: String,
    src: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    href: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseFooter {
    pub id: String,
    #[serde(flatten)]
    pub parent: Footer,
}

impl HasID for DatabaseFooter {
    fn id(&self) -> String {
        self.id.clone()
    }
}

impl TryFrom<Footer> for DatabaseFooter {
    type Error = ConversionError;

    fn try_from(parent: Footer) -> Result<Self, ConversionError> {
        Ok(DatabaseFooter {
            id: STATIC_FOOTER_ID.to_string(),
            parent,
        })
    }
}

impl Into<Footer> for DatabaseFooter {
    fn into(self) -> Footer {
        self.parent
    }
}

impl Persisted for DatabaseFooter {
    const COLLECTION: &'static str = "footer";
}
