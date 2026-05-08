const { toUserDto, serializeId } = require("./userDto");

function objectId(value) {
  return { toString: () => value };
}

describe("userDto", () => {
  test("serializes ObjectId-like values", () => {
    expect(serializeId(objectId("user-id"))).toBe("user-id");
    expect(serializeId("plain-id")).toBe("plain-id");
  });

  test("returns null for empty users", () => {
    expect(toUserDto(null)).toBeNull();
  });

  test("serializes plain users without leaking internal or sensitive fields", () => {
    const user = toUserDto({
      _id: objectId("user-id"),
      firstName: "Nacho",
      lastName: "Bru",
      userName: "nacho",
      city: "Valencia",
      email: "nacho@example.com",
      birthdate: "1998-10-20",
      profileImage: "data:image/png;base64,AAAA",
      joinedEvents: [objectId("event-id")],
      password: "secret",
      __v: 0,
      createdAt: "created",
      updatedAt: "updated",
    });

    expect(user).toEqual({
      _id: "user-id",
      id: "user-id",
      firstName: "Nacho",
      lastName: "Bru",
      userName: "nacho",
      city: "Valencia",
      email: "nacho@example.com",
      birthdate: "1998-10-20",
      profileImage: "data:image/png;base64,AAAA",
      joinedEvents: ["event-id"],
      createdAt: "created",
      updatedAt: "updated",
    });
    expect(user).not.toHaveProperty("password");
    expect(user).not.toHaveProperty("__v");
  });

  test("supports mongoose-like documents", () => {
    const user = {
      toObject: () => ({
        _id: objectId("user-id"),
        userName: "nacho",
        email: "nacho@example.com",
        password: "secret",
      }),
    };

    expect(toUserDto(user)).toEqual(expect.objectContaining({
      _id: "user-id",
      id: "user-id",
      userName: "nacho",
      email: "nacho@example.com",
    }));
  });
});
