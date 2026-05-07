jest.mock("../models/User", () => ({
  findOne: jest.fn(),
}));

jest.mock("../services/userService", () => ({
  getCurrentUser: jest.fn(),
  updateCurrentUser: jest.fn(),
}));

jest.mock("../utils/logger", () => ({
  logger: {
    error: jest.fn(),
  },
}));

const User = require("../models/User");
const userService = require("../services/userService");
const { getUser, getCurrentUser, updateCurrentUser } = require("./userController");

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

function queryResult(value) {
  return { exec: jest.fn().mockResolvedValue(value) };
}

describe("userController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns public user data", async () => {
    const user = { toObject: () => ({ userName: "nacho", password: "hidden" }) };
    User.findOne.mockReturnValue(queryResult(user));
    const res = createResponse();

    await getUser({ params: { userName: " nacho " } }, res);

    expect(User.findOne).toHaveBeenCalledWith({ userName: "nacho" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ userName: "nacho" });
  });

  test("returns 404 for missing users", async () => {
    User.findOne.mockReturnValue(queryResult(null));
    const res = createResponse();

    await getUser({ params: { userName: "missing" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns 500 when lookup fails", async () => {
    User.findOne.mockReturnValue({ exec: jest.fn().mockRejectedValue(new Error("db")) });
    const res = createResponse();

    await getUser({ params: { userName: "nacho" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("gets current authenticated user", async () => {
    userService.getCurrentUser.mockResolvedValue({ status: 200, body: { user: { userName: "nacho" } } });
    const res = createResponse();

    await getCurrentUser({ auth: { userName: "nacho" } }, res);

    expect(userService.getCurrentUser).toHaveBeenCalledWith("nacho");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("updates current authenticated user", async () => {
    const payload = { firstName: "Nacho" };
    userService.updateCurrentUser.mockResolvedValue({ status: 200, body: { user: payload } });
    const res = createResponse();

    await updateCurrentUser({ auth: { userName: "nacho" }, body: payload }, res);

    expect(userService.updateCurrentUser).toHaveBeenCalledWith("nacho", payload);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("returns 500 when current user service fails", async () => {
    userService.getCurrentUser.mockRejectedValue(new Error("service error"));
    const res = createResponse();

    await getCurrentUser({ auth: { userName: "nacho" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
