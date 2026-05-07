jest.mock("../services/userService", () => ({
  getCurrentUser: jest.fn(),
  updateCurrentUser: jest.fn(),
}));

jest.mock("../utils/logger", () => ({
  logger: {
    error: jest.fn(),
  },
}));

const userService = require("../services/userService");
const { getCurrentUser, updateCurrentUser } = require("./userController");

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe("userController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  test("returns 500 when current user update fails", async () => {
    userService.updateCurrentUser.mockRejectedValue(new Error("service error"));
    const res = createResponse();

    await updateCurrentUser({ auth: { userName: "nacho" }, body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
