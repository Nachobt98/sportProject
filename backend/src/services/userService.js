const User = require("../models/User");
const { ERROR_CODES, serviceResponse } = require("../utils/apiResponses");
const { normalizeString } = require("../utils/strings");
const { isValidEmail, parseOptionalDate } = require("../utils/validators");
const { toPublicUser } = require("../utils/users");
const {
  UPLOAD_PROFILE_IMAGE_PREFIX,
  getProfileImagePublicPath,
  removeLocalProfileImage,
} = require("../utils/profileImages");

const MAX_PROFILE_IMAGE_LENGTH = 2100000;
const PROFILE_IMAGE_PATTERN = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/;

const editableUserFields = [
  "firstName",
  "lastName",
  "city",
  "email",
  "birthdate",
  "profileImage",
];

function isValidProfileImage(profileImage) {
  if (!profileImage) {
    return true;
  }

  return (
    typeof profileImage === "string" &&
    profileImage.length <= MAX_PROFILE_IMAGE_LENGTH &&
    (PROFILE_IMAGE_PATTERN.test(profileImage) || profileImage.startsWith(UPLOAD_PROFILE_IMAGE_PREFIX))
  );
}

function buildEditableUserPayload(payload) {
  const update = {};

  editableUserFields.forEach((field) => {
    if (payload[field] === undefined) {
      return;
    }

    if (field === "birthdate") {
      const dateResult = parseOptionalDate(payload.birthdate);
      if (dateResult.error) {
        update.birthdateError = true;
        return;
      }
      update.birthdate = dateResult.value;
      return;
    }

    if (field === "profileImage") {
      update.profileImage = payload.profileImage || "";
      return;
    }

    update[field] = normalizeString(payload[field]);
  });

  if (update.birthdateError) {
    delete update.birthdateError;
    return { error: "La fecha de nacimiento no es valida", code: ERROR_CODES.VALIDATION_ERROR };
  }

  if (!isValidProfileImage(update.profileImage)) {
    return { error: "La imagen de perfil no es valida o es demasiado grande", code: ERROR_CODES.VALIDATION_ERROR };
  }

  if (update.email !== undefined && !update.email) {
    return { error: "El email no puede estar vacio", code: ERROR_CODES.VALIDATION_ERROR };
  }

  if (update.email !== undefined && !isValidEmail(update.email)) {
    return { error: "El email no tiene un formato valido", code: ERROR_CODES.VALIDATION_ERROR };
  }

  if (update.email) {
    update.email = update.email.toLowerCase();
  }

  return { value: update };
}

async function getCurrentUser(userName) {
  const user = await User.findOne({ userName }).exec();

  if (!user) {
    return serviceResponse(404, "Usuario no encontrado", {}, ERROR_CODES.USER_NOT_FOUND);
  }

  return { status: 200, body: { user: toPublicUser(user) } };
}

async function updateCurrentUser(userName, payload) {
  const { value, error, code } = buildEditableUserPayload(payload);

  if (error) {
    return serviceResponse(400, error, {}, code);
  }

  const user = await User.findOne({ userName }).exec();

  if (!user) {
    return serviceResponse(404, "Usuario no encontrado", {}, ERROR_CODES.USER_NOT_FOUND);
  }

  if (value.email && value.email !== user.email) {
    const duplicatedEmail = await User.findOne({ email: value.email }).exec();
    if (duplicatedEmail) {
      return serviceResponse(409, "Ya existe un usuario con ese email", {}, ERROR_CODES.DUPLICATE_EMAIL);
    }
  }

  const previousProfileImage = user.profileImage;
  Object.assign(user, value);
  await user.save();

  if (value.profileImage !== undefined && previousProfileImage !== value.profileImage) {
    removeLocalProfileImage(previousProfileImage);
  }

  return { status: 200, body: { user: toPublicUser(user) } };
}

async function updateCurrentUserProfileImage(userName, file) {
  if (!file) {
    return serviceResponse(400, "La imagen de perfil es requerida", {}, ERROR_CODES.VALIDATION_ERROR);
  }

  const user = await User.findOne({ userName }).exec();

  if (!user) {
    removeLocalProfileImage(getProfileImagePublicPath(file.filename));
    return serviceResponse(404, "Usuario no encontrado", {}, ERROR_CODES.USER_NOT_FOUND);
  }

  const previousProfileImage = user.profileImage;
  user.profileImage = getProfileImagePublicPath(file.filename);
  await user.save();
  removeLocalProfileImage(previousProfileImage);

  return { status: 200, body: { user: toPublicUser(user) } };
}

module.exports = {
  buildEditableUserPayload,
  getCurrentUser,
  updateCurrentUser,
  updateCurrentUserProfileImage,
  isValidProfileImage,
};
