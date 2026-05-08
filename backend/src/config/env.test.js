const { DEFAULT_JWT_SECRET, validateEnv } = require("./env");

describe("env config", () => {
  test("allows local default JWT secret outside production", () => {
    expect(validateEnv({
      nodeEnv: "development",
      jwtSecret: DEFAULT_JWT_SECRET,
      passwordHashRounds: 10,
    })).toEqual(expect.objectContaining({ nodeEnv: "development" }));
  });

  test("rejects default JWT secret in production", () => {
    expect(() => validateEnv({
      nodeEnv: "production",
      jwtSecret: DEFAULT_JWT_SECRET,
      passwordHashRounds: 10,
    })).toThrow("JWT_SECRET must be set to a non-default value in production");
  });

  test("rejects invalid password hash rounds", () => {
    expect(() => validateEnv({
      nodeEnv: "development",
      jwtSecret: "custom-secret",
      passwordHashRounds: 3,
    })).toThrow("PASSWORD_HASH_ROUNDS must be an integer greater than or equal to 4");
  });
});
