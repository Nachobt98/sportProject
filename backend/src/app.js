const express = require("express");
const cors = require("cors");
const { config } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");

function createApp() {
  const app = express();

  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json({ limit: "3mb" }));

  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", authRoutes);
  app.use("/api", eventRoutes);
  app.use("/api", userRoutes);

  return app;
}

module.exports = { createApp };
