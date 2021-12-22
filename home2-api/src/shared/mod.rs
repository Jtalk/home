use serde::Serialize;

pub mod crud;

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub message: String,
}

impl ErrorResponse {
    pub fn new<T: Into<String>>(message: T) -> Self {
        ErrorResponse {
            message: message.into(),
        }
    }
}

#[cfg(test)]
pub mod testing {
    use std::sync::Once;

    static LOG_ONCE: Once = Once::new();

    pub fn setup_test_logger() {
        LOG_ONCE.call_once(|| {
            simplelog::SimpleLogger::init(
                simplelog::LevelFilter::Debug,
                simplelog::Config::default(),
            )
            .unwrap();
        })
    }
}
