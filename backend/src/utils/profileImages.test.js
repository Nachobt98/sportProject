const fs = require("fs");
const path = require("path");

jest.spyOn(fs.promises, "unlink").mockResolvedValue(undefined);

const {
  UPLOAD_PROFILE_IMAGE_PREFIX,
  getProfileImagePublicPath,
  isLocalUploadedProfileImage,
  removeLocalProfileImage,
} = require("./profileImages");

describe("profileImages helpers", () => {
  beforeEach(() => {
    fs.promises.unlink.mockClear();
  });

  test("builds public uploaded profile image paths", () => {
    expect(getProfileImagePublicPath("nacho.png")).toBe(`${UPLOAD_PROFILE_IMAGE_PREFIX}nacho.png`);
  });

  test("detects local uploaded profile images", () => {
    expect(isLocalUploadedProfileImage("/uploads/profile-images/nacho.png")).toBe(true);
    expect(isLocalUploadedProfileImage("legacy-inline-image")).toBe(false);
    expect(isLocalUploadedProfileImage("")).toBe(false);
    expect(isLocalUploadedProfileImage(null)).toBe(false);
  });

  test("removes local uploaded profile images", () => {
    removeLocalProfileImage("/uploads/profile-images/nacho.png");

    expect(fs.promises.unlink).toHaveBeenCalledWith(
      expect.stringContaining(path.join("uploads", "profile-images", "nacho.png"))
    );
  });

  test("does not remove unsupported profile image values", () => {
    removeLocalProfileImage("legacy-inline-image");
    removeLocalProfileImage("");

    expect(fs.promises.unlink).not.toHaveBeenCalled();
  });

  test("swallows file deletion errors", async () => {
    fs.promises.unlink.mockRejectedValueOnce(new Error("missing"));

    removeLocalProfileImage("/uploads/profile-images/missing.png");
    await Promise.resolve();

    expect(fs.promises.unlink).toHaveBeenCalled();
  });
});
