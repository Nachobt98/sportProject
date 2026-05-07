const { toPublicUser } = require("./users");

describe("user utils", () => {
  test("removes password from plain user objects", () => {
    expect(toPublicUser({ userName: "nacho", password: "secret" })).toEqual({ userName: "nacho" });
  });

  test("supports mongoose-like documents", () => {
    const user = { toObject: () => ({ userName: "nacho", password: "secret", city: "Valencia" }) };
    expect(toPublicUser(user)).toEqual({ userName: "nacho", city: "Valencia" });
  });

  test("returns null for empty values", () => {
    expect(toPublicUser(null)).toBeNull();
  });
});
