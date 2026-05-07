const mongoose = require("mongoose");
const { config } = require("./env");
const { logger } = require("../utils/logger");

async function connectDatabase() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info(`MongoDB conectado: ${config.mongoUri}`);
  } catch (error) {
    logger.error("Error conectando con MongoDB:", error);
    process.exit(1);
  }
}

module.exports = { connectDatabase };
