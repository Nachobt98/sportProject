jest.mock("../models/User", () => jest.fn());

jest.mock("../services/authService", () => ({
  createSessionToken: jest.fn(),
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}));

jest.mock("../utils/users", () => ({
  toPublicUser: jest.fn((user) => ({ userName: user.userName })),
}));

jest.mock("../utils/logger", () => ({
  logger: {
    error: jest.fn(),
  },
}));

const User = require("../models/User");
const authService = require("../services/authService");
const { ERROR_CODES } = require("../utils/apiResponses");
const controller = require("./authController");

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

function queryResult(value) {
  return { exec: jest.fn().mockResolvedValue(value) };
}

function validRegisterBody(overrides = {}) {
  return {
    firstName: "Nacho",
    lastName: "Bru",
    userName: "nacho",
    email: "nacho@example.com",
    password: "Input123",
    ...overrides,
  };
}

function expectErrorCode(res, code) {
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
    error: expect.objectContaining({ code }),
  }));
}

describe("authController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authService.createSessionToken.mockReturnValue("session-token");
    authService.hashPassword.mockResolvedValue("hashed-value");
  });

  test("registers a new user", async () => {
    const savedUser = { userName: "nacho", save: jest.fn().mockResolvedValue(undefined) };
    User.findOne = jest.fn().mockReturnValue(queryResult(null));
    User.mockImplementation(() => savedUser);
    const res = createResponse();

    await controller.register({ body: validRegisterBody({ email: "NACHO@example.com" }) }, res);

    expect(User).toHaveBeenCalledWith(expect.objectContaining({ email: "nacho@example.com" }));
    expect(savedUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: "session-token" }));
  });

  test("handles registration errors", async () => {
    User.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error("boom")),
    });
    const res = createResponse();

    await controller.register({ body: validRegisterBody() }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expectErrorCode(res, ERROR_CODES.INTERNAL_ERROR);
  });

  test("rejects incomplete registration data", async () => {
    const res = createResponse();

    await controller.register({ body: { userName: "nacho" } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expectErrorCode(res, ERROR_CODES.VALIDATION_ERROR);
  });

  test("rejects invalid registration email", async () => {
    const res = createResponse();

    await controller.register({ body: validRegisterBody({ email: "bad-email" }) }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expectErrorCode(res, ERROR_CODES.VALIDATION_ERROR);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test("rejects short registration passwords", async () => {
    const res = createResponse();

    await controller.register({ body: validRegisterBody({ password: "short" }) }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expectErrorCode(res, ERROR_CODES.VALIDATION_ERROR);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test("rejects invalid registration birthdates", async () => {
    const res = createResponse();

    await controller.register({ body: validRegisterBody({ birthdate: "bad-date" }) }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expectErrorCode(res, ERROR_CODES.VALIDATION_ERROR);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test("rejects invalid profile images during registration", async () => {
    const res = createResponse();

    await controller.register({ body: validRegisterBody({ profileImage: "invalid-image" }) }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expectErrorCode(res, ERROR_CODES.VALIDATION_ERROR);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test("rejects duplicated users", async () => {
    User.findOne = jest.fn().mockReturnValue(queryResult({ userName: "nacho" }));
    const res = createResponse();

    await controller.register({ body: validRegisterBody() }, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expectErrorCode(res, ERROR_CODES.DUPLICATE_USER);
  });

  test("logs in valid users", async () => {
    const user = { userName: "nacho", password: "hashed-value", save: jest.fn() };
    User.findOne = jest.fn().mockReturnValue(queryResult(user));
    authService.verifyPassword.mockResolvedValue(true);
    const res = createResponse();

    await controller.login({ body: { userName: "nacho", password: "Input123" } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: "session-token" }));
  });

  test("migrates plaintext passwords on login", async () => {
    const user = { userName: "nacho", password: "Input123", save: jest.fn().mockResolvedValue(undefined) };
    User.findOne = jest.fn().mockReturnValue(queryResult(user));
    authService.verifyPassword.mockResolvedValue(true);
    const res = createResponse();

    await controller.login({ body: { userName: "nacho", password: "Input123" } }, res);

    expect(authService.hashPassword).toHaveBeenCalledWith("Input123");
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("keeps already hashed passwords on login", async () => {
    const user = { userName: "nacho", password: "$2b$hashed-value", save: jest.fn() };
    User.findOne = jest.fn().mockReturnValue(queryResult(user));
    authService.verifyPassword.mockResolvedValue(true);
    const res = createResponse();

    await controller.login({ body: { userName: "nacho", password: "Input123" } }, res);

    expect(authService.hashPassword).not.toHaveBeenCalled();
    expect(user.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("rejects missing users and wrong passwords", async () => {
    const res = createResponse();
    User.findOne = jest.fn().mockReturnValue(queryResult(null));

    await controller.login({ body: { userName: "nacho", password: "Input123" } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expectErrorCode(res, ERROR_CODES.AUTH_INVALID_CREDENTIALS);

    User.findOne = jest.fn().mockReturnValue(queryResult({ userName: "nacho", password: "hash" }));
    authService.verifyPassword.mockResolvedValue(false);

    await controller.login({ body: { userName: "nacho", password: "Input123" } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expectErrorCode(res, ERROR_CODES.AUTH_INVALID_CREDENTIALS);
  });

  test("handles login errors", async () => {
    User.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error("boom")),
    });
    const res = createResponse();

    await controller.login({ body: { userName: "nacho", password: "Input123" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expectErrorCode(res, ERROR_CODES.INTERNAL_ERROR);
  });

  test("rejects invalid login data", async () => {
    const res = createResponse();

    await controller.login({ body: { userName: "" } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expectErrorCode(res, ERROR_CODES.AUTH_MISSING_CREDENTIALS);
  });

  test("gets current session", async () => {
    User.findOne = jest.fn().mockReturnValue(queryResult({ userName: "nacho" }));
    const res = createResponse();

    await controller.getSession({ auth: { userName: "nacho" } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user: { userName: "nacho" } });
  });

  test("returns 404 or 500 when session user cannot be loaded", async () => {
    const res = createResponse();
    User.findOne = jest.fn().mockReturnValue(queryResult(null));

    await controller.getSession({ auth: { userName: "missing" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expectErrorCode(res, ERROR_CODES.USER_NOT_FOUND);

    User.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error("boom")),
    });

    await controller.getSession({ auth: { userName: "nacho" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expectErrorCode(res, ERROR_CODES.INTERNAL_ERROR);
  });
});
