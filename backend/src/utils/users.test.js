const { toPublicUser } = require("./users");

function objectId(value) {
  return { toString: () => value };
}

describe("user utils", () => {
  test("serializes public user objects through the DTO", () => {
    expect(toPublicUser({
      _id: objectId("user-id"),
      userName: "nacho",
      email: "nacho@example.com",
      password: "secret",
      __v: 0,
    })).toEqual(expect.objectContaining({
      _id: "user-id",
      id: "user-id",
      userName: "nacho",
      email: "nacho@example.com",
    }));
  });

  test("does not expose password or mongoose internals", () => {
    const publicUser = toPublicUser({ userName: "nacho", password: "secret", __v: 0 });

    expect(publicUser).not.toHaveProperty("password");
    expect(publicUser).not.toHaveProperty("__v");
  });

  test("supports mongoose-like documents", () => {
    const user = {
      toObject: () => ({
        _id: objectId("user-id"),
        userName: "nacho",
        password: "secret",
        city: "Valencia",
      }),
    };

    expect(toPublicUser(user)).toEqual(expect.objectContaining({
      _id: "user-id",
      id: "user-id",
      userName: "nacho",
      city: "Valencia",
    }));
  });

  test("returns null for empty values", () => {
    expect(toPublicUser(null)).toBeNull();
  });
});
