jest.mock("../models/User", () => jest.fn());

jest.mock("../services/authService", () => ({
  createSessionToken: jest.fn(),
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}));

jest.mock("../utils/users", () => ({
  toPublicUser: jest.fn((user) => ({ userName: user.userName })),
}));

const User = require("../models/User");
const authService = require("../services/authService");
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

    await controller.register({
      body: {
        firstName: "Nacho",
        lastName: "Bru",
        userName: "nacho",
        email: "nacho@example.com",
        password: "Input123",
      },
    }, res);

    expect(savedUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: "session-token" }));
  });

  test("rejects incomplete registration data", async () => {
    const res = createResponse();

    await controller.register({ body: { userName: "nacho" } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("rejects duplicated users", async () => {
    User.findOne = jest.fn().mockReturnValue(queryResult({ userName: "nacho" }));
    const res = createResponse();

    await controller.register({
      body: {
        firstName: "Nacho",
        lastName: "Bru",
        userName: "nacho",
        email: "nacho@example.com",
        password: "Input123",
      },
    }, res);

    expect(res.status).toHaveBeenCalledWith(409);
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

  test("rejects invalid login data", async () => {
    const res = createResponse();

    await controller.login({ body: { userName: "" } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("gets current session", async () => {
    User.findOne = jest.fn().mockReturnValue(queryResult({ userName: "nacho" }));
    const res = createResponse();

    await controller.getSession({ auth: { userName: "nacho" } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user: { userName: "nacho" } });
  });
});
