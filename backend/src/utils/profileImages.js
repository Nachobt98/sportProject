const fs = require("fs");
const path = require("path");

const UPLOAD_PROFILE_IMAGE_PREFIX = "/uploads/profile-images/";

function isLocalUploadedProfileImage(profileImage = "") {
  return typeof profileImage === "string" && profileImage.startsWith(UPLOAD_PROFILE_IMAGE_PREFIX);
}

function getProfileImagePublicPath(fileName) {
  return `${UPLOAD_PROFILE_IMAGE_PREFIX}${fileName}`;
}

function getUploadedFilePath(profileImage = "") {
  const fileName = path.basename(profileImage);
  return path.join(__dirname, "..", "..", "uploads", "profile-images", fileName);
}

function removeLocalProfileImage(profileImage = "") {
  if (!isLocalUploadedProfileImage(profileImage)) {
    return;
  }

  fs.promises.unlink(getUploadedFilePath(profileImage)).catch(() => undefined);
}

module.exports = {
  UPLOAD_PROFILE_IMAGE_PREFIX,
  getProfileImagePublicPath,
  isLocalUploadedProfileImage,
  removeLocalProfileImage,
};
