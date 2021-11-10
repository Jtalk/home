use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub message: String,
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
