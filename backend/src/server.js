const { config } = require("./config/env");
const { connectDatabase } = require("./config/database");
const { createApp } = require("./app");

async function startServer() {
  await connectDatabase();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Backend escuchando en http://localhost:${config.port}`);
  });
}

startServer();
