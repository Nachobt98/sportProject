jest.mock("../models/User", () => ({
  findOne: jest.fn(),
}));

const User = require("../models/User");
const { getUser } = require("./userController");

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
    jest.spyOn(console, "error").mockImplementation(() => {});
    User.findOne.mockReturnValue({ exec: jest.fn().mockRejectedValue(new Error("db")) });
    const res = createResponse();

    await getUser({ params: { userName: "nacho" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    console.error.mockRestore();
  });
});
