jest.mock("../models/User", () => ({
  findOne: jest.fn(),
}));

const User = require("../models/User");
const userService = require("./userService");

function queryResult(value) {
  return { exec: jest.fn().mockResolvedValue(value) };
}

function createUser(overrides = {}) {
  return {
    userName: "nacho",
    email: "nacho@example.com",
    save: jest.fn().mockResolvedValue(undefined),
    toObject: () => ({
      userName: "nacho",
      email: "nacho@example.com",
      password: "hidden",
      ...overrides,
    }),
    ...overrides,
  };
}

describe("userService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("validates profile images", () => {
    expect(userService.isValidProfileImage("")).toBe(true);
    expect(userService.isValidProfileImage("data:image/png;base64,AAAA")).toBe(true);
    expect(userService.isValidProfileImage("https://example.com/avatar.png")).toBe(false);
  });

  test("builds editable user payloads", () => {
    const result = userService.buildEditableUserPayload({
      firstName: " Nacho ",
      lastName: " Bru ",
      city: " Valencia ",
      email: " nacho@example.com ",
      birthdate: "1998-10-20",
      profileImage: "data:image/webp;base64,AAAA",
    });

    expect(result.value).toEqual(expect.objectContaining({
      firstName: "Nacho",
      lastName: "Bru",
      city: "Valencia",
      email: "nacho@example.com",
      profileImage: "data:image/webp;base64,AAAA",
    }));
    expect(result.value.birthdate).toBeInstanceOf(Date);
  });

  test("rejects invalid payloads", () => {
    expect(userService.buildEditableUserPayload({ birthdate: "bad-date" }).error).toBe(
      "La fecha de nacimiento no es valida"
    );
    expect(userService.buildEditableUserPayload({ email: "   " }).error).toBe(
      "El email no puede estar vacio"
    );
    expect(userService.buildEditableUserPayload({ profileImage: "bad-image" }).error).toBe(
      "La imagen de perfil no es valida o es demasiado grande"
    );
  });

  test("gets current user", async () => {
    User.findOne.mockReturnValue(queryResult(createUser({ firstName: "Nacho" })));

    const result = await userService.getCurrentUser("nacho");

    expect(result.status).toBe(200);
    expect(result.body.user).toEqual(expect.objectContaining({ firstName: "Nacho" }));
  });

  test("returns 404 when current user is missing", async () => {
    User.findOne.mockReturnValue(queryResult(null));

    await expect(userService.getCurrentUser("missing")).resolves.toEqual(
      expect.objectContaining({ status: 404 })
    );
  });

  test("updates current user", async () => {
    const user = createUser();
    User.findOne
      .mockReturnValueOnce(queryResult(user))
      .mockReturnValueOnce(queryResult(null));

    const result = await userService.updateCurrentUser("nacho", {
      firstName: "Nacho",
      email: "new@example.com",
      profileImage: "data:image/jpeg;base64,AAAA",
    });

    expect(result.status).toBe(200);
    expect(user.firstName).toBe("Nacho");
    expect(user.email).toBe("new@example.com");
    expect(user.profileImage).toBe("data:image/jpeg;base64,AAAA");
    expect(user.save).toHaveBeenCalled();
  });

  test("rejects duplicated email updates", async () => {
    User.findOne
      .mockReturnValueOnce(queryResult(createUser()))
      .mockReturnValueOnce(queryResult(createUser({ userName: "other", email: "new@example.com" })));

    const result = await userService.updateCurrentUser("nacho", { email: "new@example.com" });

    expect(result.status).toBe(409);
  });
});
