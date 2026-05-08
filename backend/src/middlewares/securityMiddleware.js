const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const express = require("express");
const { buildErrorBody, ERROR_CODES } = require("../utils/apiResponses");

const JSON_BODY_LIMIT = "1mb";
const GENERAL_WINDOW_MS = 15 * 60 * 1000;
const AUTH_WINDOW_MS = 15 * 60 * 1000;

function buildRateLimitHandler(message) {
  return function rateLimitHandler(req, res) {
    return res.status(429).json(buildErrorBody(message, ERROR_CODES.RATE_LIMITED));
  };
}

const generalApiLimiter = rateLimit({
  windowMs: GENERAL_WINDOW_MS,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildRateLimitHandler("Demasiadas peticiones. Intentalo de nuevo mas tarde"),
});

const authLimiter = rateLimit({
  windowMs: AUTH_WINDOW_MS,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildRateLimitHandler("Demasiados intentos de autenticacion. Intentalo de nuevo mas tarde"),
});

function applySecurityMiddleware(app) {
  app.use(helmet());
  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use("/api", generalApiLimiter);
}

module.exports = {
  JSON_BODY_LIMIT,
  generalApiLimiter,
  authLimiter,
  applySecurityMiddleware,
};
