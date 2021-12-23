use crate::database::oid::{ConversionError, ObjectID};
use crate::database::Sortable;
use chrono::{DateTime, Utc};
use field_types::FieldName;
use mongodb::bson::serde_helpers::u64_as_f64;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageMetadata {
    pub description: Option<String>,
    pub content_type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FieldName)]
#[serde(rename_all = "camelCase")]
pub struct ImageFile {
    #[serde(rename = "_id")]
    pub id: ObjectID,
    pub filename: String,
    #[serde(with = "u64_as_f64")]
    pub length: u64,
    #[serde(rename = "uploadDate")]
    pub uploaded: DateTime<Utc>,
    pub metadata: ImageMetadata,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseImageFile {
    #[serde(flatten)]
    pub parent: ImageFile,
}

impl Sortable for DatabaseImageFile {
    type Field = ImageFileFieldName;

    //noinspection RsTypeCheck
    fn field_name_string(f: &Self::Field) -> &'static str {
        match f {
            Self::Field::Uploaded => "upload_date",
            v @ _ => v.name(),
        }
    }
}

impl TryFrom<ImageFile> for DatabaseImageFile {
    type Error = ConversionError;

    fn try_from(mut parent: ImageFile) -> Result<Self, ConversionError> {
        parent.id = parent.id.into_raw("id")?;
        Ok(DatabaseImageFile { parent })
    }
}

impl Into<ImageFile> for DatabaseImageFile {
    fn into(self) -> ImageFile {
        let mut result = self.parent;
        result.id = result.id.into_string();
        result
    }
}
