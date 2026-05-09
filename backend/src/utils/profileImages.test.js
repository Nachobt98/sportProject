const {
  UPLOAD_PROFILE_IMAGE_PREFIX,
  getProfileImagePublicPath,
  isLocalUploadedProfileImage,
} = require("./profileImages");

describe("profileImages helpers", () => {
  test("builds public uploaded profile image paths", () => {
    expect(getProfileImagePublicPath("nacho.png")).toBe(`${UPLOAD_PROFILE_IMAGE_PREFIX}nacho.png`);
  });

  test("detects local uploaded profile images", () => {
    expect(isLocalUploadedProfileImage("/uploads/profile-images/nacho.png")).toBe(true);
    expect(isLocalUploadedProfileImage("data:image/png;base64,AAAA")).toBe(false);
    expect(isLocalUploadedProfileImage("")).toBe(false);
  });
});
