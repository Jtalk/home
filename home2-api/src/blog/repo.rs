use std::sync::Arc;

use convert_case::Case::Camel;
use convert_case::Casing;
use futures::TryStreamExt;
use mongodb::bson::{doc, Document};

use crate::database::{self, Database};
use crate::shared::crud::get::FindError;

use super::model::ArticleFieldName;

pub const TABLE_METADATA: &database::CollectionMetadata = "articles";

pub type ListTagsError = FindError;
pub type ListTagsResult = std::result::Result<Vec<String>, ListTagsError>;

pub struct Repo {
    db: Arc<Database>,
}

impl Repo {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub async fn tags(&self) -> ListTagsResult {
        let col = self.db.db().collection::<Document>(TABLE_METADATA);
        let tags_field: String = ArticleFieldName::Tags.name().to_case(Camel);
        let tags_ref = format!("${}", tags_field);
        let agg = [
            doc! { "$project": { tags_field: 1 } },
            doc! { "$unwind": &tags_ref },
            doc! { "$group": { "_id": &tags_ref } },
            doc! { "$sort": { "_id": 1 } },
            doc! { "$group": { "_id": null, "tags": { "$push": "$_id" } } },
            doc! { "$project": { "_id": 0, "value": "$tags" } },
        ];

        let cursor = col
            .aggregate(agg, None)
            .await
            .map_err(database::Error::from)?;
        let mut found_raw: Vec<Document> =
            cursor.try_collect().await.map_err(database::Error::from)?;
        if found_raw.is_empty() {
            return Ok(vec![]);
        }

        let found: Document = found_raw.remove(0);
        let result = found
            .get("value")
            .expect("The name is set in the above query")
            .as_array()
            .expect("Must be an array according to the pipeline above");
        Ok(result
            .iter()
            .map(|v| {
                v.as_str()
                    .expect("Must be string according to the table schema")
                    .to_string()
            })
            .collect())
    }
}
