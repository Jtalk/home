use chrono::{DateTime, Utc};
use field_types::FieldName;
use serde::{self, Deserialize, Serialize};
use uuid::Uuid;

use crate::database::{HasID, Persisted, Sortable};

#[derive(Debug, Serialize, Deserialize, FieldName)]
#[serde(rename_all = "camelCase")]
pub struct Article {
    pub id: String,
    pub title: String,
    pub published: bool,
    pub created: DateTime<Utc>,
    pub updated: DateTime<Utc>,
    pub content: String,
    pub tags: Vec<String>,
    pub atom_id: Uuid,
}

impl<'a> Article {
    pub fn preview(&'a self) -> Option<&'a str> {
        if let Some(post_preview) = self.content.splitn(2, "<preview>").skip(1).next() {
            if let Some(preview) = post_preview.splitn(2, "</preview>").next() {
                return Some(preview);
            }
        }
        None
    }
}

impl HasID for Article {
    fn id(&self) -> String {
        self.id.clone()
    }
}

impl Sortable for Article {
    type Field = ArticleFieldName;

    // It breaks intellij, the field name is generated by the above derive.
    //noinspection RsTypeCheck
    fn field_name_string(f: &ArticleFieldName) -> &'static str {
        return f.name();
    }
}

impl Persisted for Article {
    const COLLECTION: &'static str = "articles";
}
