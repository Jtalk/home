use std::sync::Arc;

use crate::search::repo::SearchRequest;

use super::repo::Repo;
pub use super::repo::SearchResult;

pub struct Service {
    repo: Arc<Repo>,
}

impl Service {
    pub fn new(repo: Arc<Repo>) -> Self {
        Self { repo }
    }

    pub async fn search(&self, search: &str, limit: u32) -> SearchResult {
        let req = SearchRequest { search, limit };
        self.repo.search(&req).await
    }
}
