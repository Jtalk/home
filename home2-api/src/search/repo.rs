use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, Responder};
use derive_more::From;
use futures::StreamExt;
use mongodb::bson::{doc, from_document, Document};

use crate::database::{self, Database, DatabaseError};
use crate::search::model::{DatabaseSearchItem, SearchItem, SearchItemMetadata};

pub struct SearchRequest<'a> {
    pub search: &'a str,
    pub limit: u32,
}

#[derive(Debug, From)]
pub enum SearchError {
    Database(database::DatabaseError),
}
pub type SearchResult = std::result::Result<Vec<SearchItem>, SearchError>;

pub struct Repo {
    db: Arc<Database>,
}

impl Repo {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub async fn search(&self, req: &SearchRequest<'_>) -> SearchResult {
        let collections = DatabaseSearchItem::collections();
        let (root, rest) = collections
            .split_first()
            .expect("There should always be at least one collection");
        let pipeline = search_pipeline(req, root, rest);
        let mut found = self
            .db
            .db()
            .collection::<Document>(root.collection)
            .aggregate(pipeline, None)
            .await?;
        let mut results: Vec<SearchItem> = Vec::with_capacity(req.limit as usize);
        while let Some(v) = found.next().await {
            match v {
                Err(e) => {
                    return Err(SearchError::Database(e));
                }
                Ok(v) => {
                    let deserialised: DatabaseSearchItem = from_document(v)
                        .map_err(|e| SearchError::Database(DatabaseError::from(e)))?;
                    results.push(deserialised.into());
                }
            }
        }
        Ok(results)
    }
}

impl Responder for SearchError {
    fn respond_to(self, req: &HttpRequest) -> HttpResponse {
        match self {
            Self::Database(e) => database::Error::Database(e).respond_to(req),
        }
    }
}

fn search_pipeline(
    req: &SearchRequest,
    root: &SearchItemMetadata,
    rest: &[SearchItemMetadata],
) -> Vec<Document> {
    let root_pipeline = search_collection_pipeline(root.denominator, req);
    let all_colls = rest.into_iter().map(|c| {
        doc!{ "$unionWith": { "coll": c.collection, "pipeline": search_collection_pipeline(c.denominator, req) } }
    });
    let sort_all = vec![
        doc! { "$sort": { "score": -1 } },
        doc! { "$limit": req.limit },
    ];
    root_pipeline
        .into_iter()
        .chain(all_colls)
        .chain(sort_all)
        .collect()
}

fn search_collection_pipeline(denominator: &str, req: &SearchRequest) -> Vec<Document> {
    vec![
        doc! { "$match": { "$text": { "$search": req.search } } },
        doc! { "$project": { "score": { "$meta": "textScore" }, "value": "$$ROOT" } },
        doc! { "$set": { "type": denominator } },
        doc! { "$sort": { "score": -1 } },
        doc! { "$limit": req.limit },
    ]
}
