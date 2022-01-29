use std::borrow::Borrow;
use std::fmt::{Debug, Formatter};

use chrono::{DateTime, Utc};
use serde::{self, Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct LoginForm {
    pub login: String,
    pub password: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum LoginStatus {
    Ok,
    Error,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct LoginResponse {
    status: LoginStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    expiry: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "String::is_empty")]
    error: String,
}

impl Debug for LoginForm {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        f.write_str("LoginForm(login=\"")?;
        f.write_str(self.login.borrow())?;
        f.write_str("\", password=\"<redacted>\")")
    }
}

impl LoginResponse {
    pub fn success(expiry: DateTime<Utc>) -> LoginResponse {
        LoginResponse {
            status: LoginStatus::Ok,
            expiry: Some(expiry),
            error: String::new(),
        }
    }

    pub fn error(message: String) -> LoginResponse {
        LoginResponse {
            status: LoginStatus::Error,
            expiry: None,
            error: message,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AuthenticationType {
    Login,
    OAuth2,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PasswordType {
    PBKDF2WithHmacSHA512,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Authentication {
    pub id: String,
    #[serde(rename = "type")]
    pub authentication_type: AuthenticationType,
    pub login: Option<Login>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Login {
    pub login: String,
    pub hash: String,
    #[serde(rename = "passwordType")]
    pub password_type: PasswordType,
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use chrono::{DateTime, Utc};
    use serde_json::{self, json};

    use crate::auth::model::{LoginForm, LoginResponse};

    #[test]
    fn login_form_debug() {
        let form = LoginForm {
            login: "username1".to_string(),
            password: "secret-password".to_string(),
        };
        let formatted = format!("{:?}", form);
        assert_eq!(
            formatted,
            "LoginForm(login=\"username1\", password=\"<redacted>\")"
        );
    }

    #[test]
    fn login_response_success() {
        let expiry = DateTime::from_str("2021-12-11T13:14:15Z").unwrap();
        let response = LoginResponse::success(expiry);
        let serialised = serde_json::to_value(&response).unwrap();
        let expected = json!({
            "status": "ok",
            "expiry": "2021-12-11T13:14:15Z",
        });
        assert_eq!(serialised, expected);
    }

    #[test]
    fn login_response_error() {
        let response = LoginResponse::error("Test Error".to_string());
        let serialised = serde_json::to_value(&response).unwrap();
        let expected = json!({
            "status": "error",
            "error": "Test Error",
        });
        assert_eq!(serialised, expected);
    }
}
