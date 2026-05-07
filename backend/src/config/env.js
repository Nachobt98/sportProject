const { loadLocalEnv } = require("./loadEnv");

loadLocalEnv();

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/sportlife",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "local-dev-secret-change-me",
  passwordHashRounds: Number(process.env.PASSWORD_HASH_ROUNDS || 10),
};

module.exports = { config };
