jest.mock("../services/authService", () => ({
  verifySessionToken: jest.fn(),
}));

const { verifySessionToken } = require("../services/authService");
const { authenticateRequest, requireSameUser } = require("./authMiddleware");

describe("authMiddleware", () => {
  function createResponse() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  }

  test("rejects missing bearer header", () => {
    const req = { get: jest.fn().mockReturnValue("") };
    const res = createResponse();
    const next = jest.fn();

    authenticateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("adds auth payload and continues for valid tokens", () => {
    verifySessionToken.mockReturnValue({ userName: "nacho" });
    const req = { get: jest.fn().mockReturnValue("Bearer token") };
    const res = createResponse();
    const next = jest.fn();

    authenticateRequest(req, res, next);

    expect(req.auth).toEqual({ userName: "nacho" });
    expect(next).toHaveBeenCalled();
  });

  test("rejects invalid tokens", () => {
    verifySessionToken.mockImplementation(() => {
      throw new Error("invalid");
    });
    const req = { get: jest.fn().mockReturnValue("Bearer token") };
    const res = createResponse();
    const next = jest.fn();

    authenticateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("allows same user operations", () => {
    const req = { params: { userName: "nacho" }, auth: { userName: "nacho" } };
    const res = createResponse();
    const next = jest.fn();

    requireSameUser(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("blocks operations over other users", () => {
    const req = { params: { userName: "other" }, auth: { userName: "nacho" } };
    const res = createResponse();
    const next = jest.fn();

    requireSameUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
