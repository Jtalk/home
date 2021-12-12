use std::borrow::Borrow;
use std::sync::Arc;

use actix_session::Session;
use chrono::{DateTime, Utc};
use derive_more::From;
use mockall_double::double;

use super::model::PasswordType::PBKDF2WithHmacSHA512;
use super::model::{AuthenticationType, Login, LoginForm};
use super::password::{self, PasswordSupport};
#[double]
use super::repo::Repo;
use super::repo::{self};
use super::LoginError::UnsupportedType;

pub const ACCESS_TOKEN_KEY: &str = "token";
pub const ACCESS_TOKEN_EXPIRY_KEY: &str = "token-expiry";
const FAKE_PASSWORD: &str = "ignored";

#[derive(Debug, From)]
pub enum VerifyError {
    BadAuthentication(&'static str),
    Other(actix_web::error::Error),
}
pub type VerifyResult = std::result::Result<(), VerifyError>;

#[derive(Debug, From)]
pub enum LoginError {
    BadCredentials,
    UnsupportedType(AuthenticationType),
    Database(repo::Error),
}
pub type LoginResult = std::result::Result<(), LoginError>;

pub struct Service {
    repo: Arc<Repo>,
    fake_login: Login,
}

impl Service {
    pub fn new(repo: Arc<Repo>) -> Self {
        let fake_login_type = PBKDF2WithHmacSHA512;
        let fake_login = Login {
            login: "".into(),
            hash: password::new(fake_login_type).hash(FAKE_PASSWORD),
            password_type: PBKDF2WithHmacSHA512,
        };
        Self { repo, fake_login }
    }

    pub fn verify(&self, session: &Session) -> VerifyResult {
        let now = Utc::now();
        let found = session.get::<String>(ACCESS_TOKEN_KEY)?;
        let expiry = session.get::<DateTime<Utc>>(ACCESS_TOKEN_EXPIRY_KEY)?;
        if let (Some(_), Some(expiry)) = (found, expiry) {
            if now < expiry {
                return Ok(());
            }
        }
        Err(VerifyError::BadAuthentication("Authentication required"))
    }

    pub async fn login(&self, form: &LoginForm) -> LoginResult {
        let found = self.repo.find_login(form).await?;
        let (login, auth_type) = match found {
            Some(ref v) => (v.login.as_ref(), Some(v.authentication_type)),
            None => (None, None),
        };
        match auth_type {
            Some(AuthenticationType::Login) => self.login_local(form, login),
            Some(other) => Err(UnsupportedType(other)),
            None => self.login_local(form, None),
        }
    }

    fn login_local(&self, form: &LoginForm, db_info_opt: Option<&Login>) -> LoginResult {
        // If there's no such credentials, we still simulate the full login cycle to battle
        // against timing attacks. We force fail the login though, even if the attacker
        // manages to guess the fake password.
        let force_fail = db_info_opt.is_none();
        let db_info = db_info_opt.unwrap_or(&self.fake_login);

        let support = password::new(db_info.password_type);
        let password_ok = support
            .check(form.password.borrow(), db_info.hash.borrow())
            .unwrap(); // Should not break on any user input, 500 internal error if breaks on hash.
        let login_ok = db_info.login == form.login;
        if login_ok && password_ok && !force_fail {
            Ok(())
        } else {
            Err(LoginError::BadCredentials)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::super::model::*;
    use super::super::password;
    use super::*;

    #[actix_web::test]
    async fn local_login_success() {
        let form = LoginForm {
            login: "gullbirdsson@example.com".into(),
            password: "passwerd".into(),
        };

        let mut repo_impl = Repo::default();
        repo_impl.expect_find_login().return_once(|ref form| {
            let authentication = Authentication {
                id: "random-string".into(),
                authentication_type: AuthenticationType::Login,
                login: Some(Login {
                    login: form.login.clone(),
                    hash: password::new(PasswordType::PBKDF2WithHmacSHA512).hash(&form.password),
                    password_type: PasswordType::PBKDF2WithHmacSHA512,
                }),
            };
            Ok(Some(authentication))
        });
        let repo = Arc::new(repo_impl);

        let instance = Service::new(repo);
        instance.login(&form).await.unwrap();
        assert!(true); // No error above
    }

    #[actix_web::test]
    async fn local_login_auth_not_found() {
        let form = LoginForm {
            login: "gullbirdsson@example.com".into(),
            password: FAKE_PASSWORD.into(),
        };

        let mut repo_impl = Repo::default();
        repo_impl.expect_find_login().return_once(|_| Ok(None));
        let repo = Arc::new(repo_impl);

        let instance = Service::new(repo);
        let result = instance.login(&form).await;

        assert!(matches!(result, Err(LoginError::BadCredentials)));
    }

    #[actix_web::test]
    async fn local_login_login_not_found() {
        let form = LoginForm {
            login: "gullbirdsson@example.com".into(),
            password: FAKE_PASSWORD.into(),
        };

        let mut repo_impl = Repo::default();
        repo_impl.expect_find_login().return_once(|ref form| {
            let authentication = Authentication {
                id: "random-string".into(),
                authentication_type: AuthenticationType::Login,
                login: None,
            };
            Ok(Some(authentication))
        });
        let repo = Arc::new(repo_impl);

        let instance = Service::new(repo);
        let result = instance.login(&form).await;

        assert!(matches!(result, Err(LoginError::BadCredentials)));
    }
}
