jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const service = require("./authService");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates session tokens", () => {
    jwt.sign.mockReturnValue("signed-token");

    const result = service.createSessionToken({
      _id: { toString: () => "user-id" },
      userName: "nacho",
    });

    expect(result).toBe("signed-token");
    expect(jwt.sign).toHaveBeenCalledWith(
      { sub: "user-id", userName: "nacho" },
      expect.any(String),
      { expiresIn: "7d" }
    );
  });

  test("hashes passwords", async () => {
    bcrypt.hash.mockResolvedValue("hashed-value");

    await expect(service.hashPassword("input-value")).resolves.toBe("hashed-value");

    expect(bcrypt.hash).toHaveBeenCalledWith("input-value", expect.any(Number));
  });

  test("validates hashed passwords", async () => {
    bcrypt.compare.mockResolvedValue(true);

    await expect(service.verifyPassword("input-value", "$2b$stored-value")).resolves.toBe(true);

    expect(bcrypt.compare).toHaveBeenCalledWith("input-value", "$2b$stored-value");
  });

  test("keeps legacy plain comparison", async () => {
    await expect(service.verifyPassword("same-value", "same-value")).resolves.toBe(true);
    await expect(service.verifyPassword("different", "same-value")).resolves.toBe(false);
  });

  test("rejects empty stored passwords", async () => {
    await expect(service.verifyPassword("input-value", "")).resolves.toBe(false);
  });

  test("verifies session tokens", () => {
    jwt.verify.mockReturnValue({ userName: "nacho" });

    expect(service.verifySessionToken("signed-token")).toEqual({ userName: "nacho" });
    expect(jwt.verify).toHaveBeenCalledWith("signed-token", expect.any(String));
  });
});
