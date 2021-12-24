use chrono::{DateTime, Utc};
use field_types::FieldName;
use mongodb::bson::serde_helpers::chrono_datetime_as_bson_datetime;
use mongodb::bson::serde_helpers::u64_as_f64;
use serde::{Deserialize, Serialize};

use crate::database::oid::{ConversionError, ObjectID};
use crate::database::Sortable;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageMetadata {
    #[serde(default)]
    pub description: String,
    pub content_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageFile {
    pub id: ObjectID,
    pub filename: String,
    pub length: u64,
    pub uploaded: DateTime<Utc>,
    pub metadata: ImageMetadata,
}

#[derive(Debug, Serialize, Deserialize, FieldName)]
#[serde(rename_all = "camelCase")]
pub struct DatabaseImageFile {
    #[serde(rename = "_id")]
    pub id: ObjectID,
    pub filename: String,
    #[serde(with = "u64_as_f64")]
    pub length: u64,
    #[serde(with = "chrono_datetime_as_bson_datetime")]
    pub upload_date: DateTime<Utc>,
    pub metadata: ImageMetadata,
}

impl Sortable for DatabaseImageFile {
    type Field = DatabaseImageFileFieldName;

    //noinspection RsTypeCheck
    fn field_name_string(f: &Self::Field) -> &'static str {
        f.name()
    }
}

impl TryFrom<ImageFile> for DatabaseImageFile {
    type Error = ConversionError;

    fn try_from(source: ImageFile) -> Result<Self, ConversionError> {
        Ok(DatabaseImageFile {
            id: source.id.into_raw("id")?,
            length: source.length,
            filename: source.filename,
            upload_date: source.uploaded,
            metadata: source.metadata,
        })
    }
}

impl Into<ImageFile> for DatabaseImageFile {
    fn into(self) -> ImageFile {
        ImageFile {
            id: self.id.into_string(),
            length: self.length,
            filename: self.filename,
            uploaded: self.upload_date,
            metadata: self.metadata,
        }
    }
}
