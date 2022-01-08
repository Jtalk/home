use std::fmt::Debug;

use crate::blog::Article;
use serde::{Deserialize, Serialize};

use crate::database::Persisted;
use crate::owner::{DatabaseOwnerInfo, OwnerInfo};
use crate::projects::{DatabaseProject, Project};

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", content = "value", rename_all = "kebab-case")]
pub enum SearchItemContent {
    Owner(OwnerInfo),
    Project(Project),
    Article(Article),
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", content = "value", rename_all = "kebab-case")]
pub enum DatabaseSearchItemContent {
    Owner(DatabaseOwnerInfo),
    Project(DatabaseProject),
    Article(Article),
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchItem {
    score: f32,
    value: SearchItemContent,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DatabaseSearchItem {
    score: f32,
    value: DatabaseSearchItemContent,
}

impl Into<SearchItem> for DatabaseSearchItem {
    fn into(self) -> SearchItem {
        SearchItem {
            score: self.score,
            value: self.value.into(),
        }
    }
}

impl Into<SearchItemContent> for DatabaseSearchItemContent {
    fn into(self) -> SearchItemContent {
        match self {
            Self::Owner(v) => SearchItemContent::Owner(v.into()),
            Self::Project(v) => SearchItemContent::Project(v.into()),
            Self::Article(v) => SearchItemContent::Article(v.into()),
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
