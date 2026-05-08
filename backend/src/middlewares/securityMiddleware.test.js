jest.mock("helmet", () => jest.fn(() => "helmet-middleware"));
jest.mock("express", () => ({
  json: jest.fn((options) => ({ type: "json", options })),
}));
jest.mock("express-rate-limit", () => jest.fn((options) => ({ type: "rate-limit", options })));

const helmet = require("helmet");
const express = require("express");
const rateLimit = require("express-rate-limit");
const { ERROR_CODES } = require("../utils/apiResponses");
const security = require("./securityMiddleware");

describe("securityMiddleware", () => {
  test("configures security middleware", () => {
    const app = { use: jest.fn() };

    security.applySecurityMiddleware(app);

    expect(helmet).toHaveBeenCalled();
    expect(express.json).toHaveBeenCalledWith({ limit: security.JSON_BODY_LIMIT });
    expect(app.use).toHaveBeenCalledWith("helmet-middleware");
    expect(app.use).toHaveBeenCalledWith({ type: "json", options: { limit: security.JSON_BODY_LIMIT } });
    expect(app.use).toHaveBeenCalledWith("/api", security.generalApiLimiter);
  });

  test("configures rate limiters with normalized error handlers", () => {
    expect(rateLimit).toHaveBeenCalledTimes(2);

    const generalOptions = rateLimit.mock.calls[0][0];
    const authOptions = rateLimit.mock.calls[1][0];
    expect(generalOptions.limit).toBe(300);
    expect(authOptions.limit).toBe(10);

    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    authOptions.handler({}, res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({ code: ERROR_CODES.RATE_LIMITED }),
    }));
  });
});
