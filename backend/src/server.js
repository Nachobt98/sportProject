const { config } = require("./config/env");
const { connectDatabase } = require("./config/database");
const { createApp } = require("./app");
const { logger } = require("./utils/logger");

async function startServer() {
  await connectDatabase();

  const app = createApp();
  app.listen(config.port, () => {
    logger.info(`Backend escuchando en http://localhost:${config.port}`);
  });
}

startServer();
