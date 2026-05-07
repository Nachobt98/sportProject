const mongoose = require("mongoose");
const { config } = require("./env");

async function connectDatabase() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log(`MongoDB conectado: ${config.mongoUri}`);
  } catch (error) {
    console.error("Error conectando con MongoDB:", error.message);
    process.exit(1);
  }
}

module.exports = { connectDatabase };
