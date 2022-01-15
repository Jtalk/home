use std::fmt::Debug;

use crate::blog::Article;
use serde::{Deserialize, Serialize};

use crate::database::Persisted;
use crate::owner::{DatabaseOwnerInfo, OwnerInfo};
use crate::projects::{DatabaseProject, Project};

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "kebab-case")]
pub enum SearchItem {
    Owner { score: f32, value: OwnerInfo },
    Project { score: f32, value: Project },
    Article { score: f32, value: Article },
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "kebab-case")]
pub enum DatabaseSearchItem {
    Owner {
        score: f32,
        value: DatabaseOwnerInfo,
    },
    Project {
        score: f32,
        value: DatabaseProject,
    },
    Article {
        score: f32,
        value: Article,
    },
}

impl Into<SearchItem> for DatabaseSearchItem {
    fn into(self) -> SearchItem {
        match self {
            Self::Owner { score, value } => SearchItem::Owner {
                score,
                value: value.into(),
            },
            Self::Project { score, value } => SearchItem::Project {
                score,
                value: value.into(),
            },
            Self::Article { score, value } => SearchItem::Article {
                score,
                value: value.into(),
            },
        }
    }
}

pub struct SearchItemMetadata {
    pub collection: &'static str,

    // This is used in the search aggregation pipeline to distinguish entities.
    // Must match the denominator defined in SearchItemContent above.
    pub denominator: &'static str,
}

impl DatabaseSearchItem {
    pub fn collections() -> [SearchItemMetadata; 3] {
        [
            SearchItemMetadata {
                collection: DatabaseOwnerInfo::COLLECTION,
                denominator: "owner",
            },
            SearchItemMetadata {
                collection: DatabaseProject::COLLECTION,
                denominator: "project",
            },
            SearchItemMetadata {
                collection: Article::COLLECTION,
                denominator: "article",
            },
        ]
    }
}
