use std::fmt::{Display, Formatter};
use std::str::FromStr;

use derive_more::From;
use mongodb::bson::{self, oid::ObjectId as Raw};
use serde::{Deserialize, Serialize, Serializer};

#[derive(Debug, Serialize, Deserialize, From)]
#[serde(untagged)]
pub enum ObjectID {
    Raw(Option<Raw>),
    String(String),
}

impl ObjectID {
    pub fn is_empty(&self) -> bool {
        match self {
            ObjectID::Raw(ref oid) => oid.is_none(),
            ObjectID::String(ref s) => s.is_empty(),
        }
    }

    pub fn into_raw(self, name: &str) -> Result<Self, ConversionError> {
        match self {
            keep @ ObjectID::Raw(_) => Ok(keep),
            ObjectID::String(ref s) if s.is_empty() => Ok(ObjectID::Raw(None)),
            ObjectID::String(ref s) => {
                let raw = Raw::from_str(s.as_ref())
                    .map_err(|e| ConversionError::from_with_field(e, name))?;
                Ok(ObjectID::Raw(Some(raw)))
            }
        }
    }

    pub fn into_string(self) -> Self {
        match self {
            keep @ ObjectID::String(_) => keep,
            ObjectID::Raw(raw) => {
                ObjectID::String(raw.map_or_else(|| String::default(), |v| v.to_string()))
            }
        }
    }
}

impl Default for ObjectID {
    fn default() -> Self {
        ObjectID::Raw(None)
    }
}

#[derive(Debug)]
pub struct ConversionError {
    message: String,
}

impl ConversionError {
    fn from_with_field(e: bson::oid::Error, field_name: &str) -> Self {
        ConversionError {
            message: format!(
                "Error parsing field {}: must be an OID, but got: {}",
                field_name, e
            ),
        }
    }
}

impl Display for ConversionError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        f.serialize_str(&self.message)
    }
}
