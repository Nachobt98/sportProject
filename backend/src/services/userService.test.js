jest.mock("../models/User", () => ({
  findOne: jest.fn(),
}));

jest.mock("../utils/profileImages", () => ({
  getProfileImagePublicPath: jest.fn((fileName) => `/uploads/profile-images/${fileName}`),
  removeLocalProfileImage: jest.fn(),
}));

const User = require("../models/User");
const profileImages = require("../utils/profileImages");
const userService = require("./userService");

function queryResult(value) {
  return { exec: jest.fn().mockResolvedValue(value) };
}

function createUser(overrides = {}) {
  return {
    userName: "nacho",
    email: "nacho@example.com",
    profileImage: "/uploads/profile-images/old.png",
    save: jest.fn().mockResolvedValue(undefined),
    toObject: () => ({
      userName: "nacho",
      email: "nacho@example.com",
      profileImage: "/uploads/profile-images/old.png",
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

  test("builds editable user payloads without profile image updates", () => {
    const result = userService.buildEditableUserPayload({
      firstName: " Nacho ",
      lastName: " Bru ",
      city: " Valencia ",
      email: " nacho@example.com ",
      birthdate: "1998-10-20",
    });

    expect(result.value).toEqual(expect.objectContaining({
      firstName: "Nacho",
      lastName: "Bru",
      city: "Valencia",
      email: "nacho@example.com",
    }));
    expect(result.value).not.toHaveProperty("profileImage");
    expect(result.value.birthdate).toBeInstanceOf(Date);
  });

  test("rejects invalid payloads", () => {
    expect(userService.buildEditableUserPayload({ birthdate: "bad-date" }).error).toBe(
      "La fecha de nacimiento no es valida"
    );
    expect(userService.buildEditableUserPayload({ email: "   " }).error).toBe(
      "El email no puede estar vacio"
    );
    expect(userService.buildEditableUserPayload({ profileImage: "legacy-inline-image" }).error).toBe(
      "La imagen de perfil debe actualizarse desde el endpoint de subida"
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
    });

    expect(result.status).toBe(200);
    expect(user.firstName).toBe("Nacho");
    expect(user.email).toBe("new@example.com");
    expect(user.profileImage).toBe("/uploads/profile-images/old.png");
    expect(user.save).toHaveBeenCalled();
  });

  test("rejects duplicated email updates", async () => {
    User.findOne
      .mockReturnValueOnce(queryResult(createUser({ email: "old@example.com" })))
      .mockReturnValueOnce(queryResult(createUser({ userName: "other", email: "new@example.com" })));

    const result = await userService.updateCurrentUser("nacho", { email: "new@example.com" });

    expect(result.status).toBe(409);
  });

  test("uploads current user profile image", async () => {
    const user = createUser({ profileImage: "/uploads/profile-images/old.png" });
    User.findOne.mockReturnValue(queryResult(user));

    const result = await userService.updateCurrentUserProfileImage("nacho", { filename: "new.png" });

    expect(result.status).toBe(200);
    expect(user.profileImage).toBe("/uploads/profile-images/new.png");
    expect(profileImages.removeLocalProfileImage).toHaveBeenCalledWith("/uploads/profile-images/old.png");
    expect(user.save).toHaveBeenCalled();
  });

  test("rejects missing profile image uploads", async () => {
    const result = await userService.updateCurrentUserProfileImage("nacho");

    expect(result.status).toBe(400);
  });

  test("removes uploaded file when profile image upload user is missing", async () => {
    User.findOne.mockReturnValue(queryResult(null));

    const result = await userService.updateCurrentUserProfileImage("missing", { filename: "orphan.png" });

    expect(result.status).toBe(404);
    expect(profileImages.removeLocalProfileImage).toHaveBeenCalledWith("/uploads/profile-images/orphan.png");
  });
});
