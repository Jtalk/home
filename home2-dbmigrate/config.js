const config = {
  mongodb: {
    url: "mongodb://localhost:27017",
    databaseName: "home",
    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    }
  },
  migrationsDir: "migrations",
  changelogCollectionName: "changelog"
};

function loadEnv(envVar, defaultValue) {
  let found = process.env[envVar];
  return found || defaultValue;
}

config.mongodb.url = loadEnv("DATABASE_URL", config.mongodb.url);
config.mongodb.databaseName = loadEnv("DATABASE_NAME", config.mongodb.databaseName);

module.exports = config;
