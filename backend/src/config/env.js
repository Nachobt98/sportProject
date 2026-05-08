const { loadLocalEnv } = require("./loadEnv");

loadLocalEnv();

const DEFAULT_JWT_SECRET = "local-dev-secret-change-me";

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/sportlife",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
  passwordHashRounds: Number(process.env.PASSWORD_HASH_ROUNDS || 10),
};

function validateEnv(currentConfig = config) {
  if (currentConfig.nodeEnv === "production" && currentConfig.jwtSecret === DEFAULT_JWT_SECRET) {
    throw new Error("JWT_SECRET must be set to a non-default value in production");
  }

  if (!Number.isInteger(currentConfig.passwordHashRounds) || currentConfig.passwordHashRounds < 4) {
    throw new Error("PASSWORD_HASH_ROUNDS must be an integer greater than or equal to 4");
  }

  return currentConfig;
}

validateEnv(config);

module.exports = { config, validateEnv, DEFAULT_JWT_SECRET };
