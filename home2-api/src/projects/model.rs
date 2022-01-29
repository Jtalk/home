use field_types::FieldName;
use mongodb::bson::serde_helpers::u32_as_f64;
use serde::{self, Deserialize, Serialize};

use crate::database::oid::ConversionError;
use crate::database::oid::ObjectID;
use crate::database::{HasID, Persisted, Sortable};

#[derive(Debug, Serialize, Deserialize, FieldName)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: String,
    pub title: String,
    #[serde(with = "u32_as_f64")]
    pub order: u32,
    pub description: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub logo_id: Option<ObjectID>,
    pub published: bool,
    pub links: Vec<ProjectLink>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectLink {
    pub name: String,
    pub href: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseProject {
    #[serde(flatten)]
    parent: Project,
}

impl HasID for DatabaseProject {
    fn id(&self) -> String {
        self.parent.id.clone()
    }
}

impl Sortable for DatabaseProject {
    type Field = ProjectFieldName;

    //noinspection RsTypeCheck
    fn field_name_string(f: &Self::Field) -> &'static str {
        f.name()
    }
}

impl TryFrom<Project> for DatabaseProject {
    type Error = ConversionError;

    fn try_from(mut parent: Project) -> Result<Self, ConversionError> {
        parent.logo_id = parent
            .logo_id
            .map_or(Ok(None), |v| v.into_raw("logoId").map(Some))?;
        Ok(DatabaseProject { parent })
    }
}

impl Into<Project> for DatabaseProject {
    fn into(self) -> Project {
        let mut result = self.parent;
        result.logo_id = result.logo_id.map(ObjectID::into_string);
        result
    }
}

impl Persisted for DatabaseProject {
    const COLLECTION: &'static str = "projects";
}
