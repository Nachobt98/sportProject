const User = require("../models/User");
const { normalizeString } = require("../utils/strings");
const { toPublicUser } = require("../utils/users");

const MAX_PROFILE_IMAGE_LENGTH = 750000;
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
    PROFILE_IMAGE_PATTERN.test(profileImage)
  );
}

function buildEditableUserPayload(payload) {
  const update = {};

  editableUserFields.forEach((field) => {
    if (payload[field] === undefined) {
      return;
    }

    if (field === "birthdate") {
      update.birthdate = payload.birthdate ? new Date(payload.birthdate) : undefined;
      return;
    }

    if (field === "profileImage") {
      update.profileImage = payload.profileImage || "";
      return;
    }

    update[field] = normalizeString(payload[field]);
  });

  if (update.birthdate && Number.isNaN(update.birthdate.getTime())) {
    return { error: "La fecha de nacimiento no es valida" };
  }

  if (!isValidProfileImage(update.profileImage)) {
    return { error: "La imagen de perfil no es valida o es demasiado grande" };
  }

  if (update.email !== undefined && !update.email) {
    return { error: "El email no puede estar vacio" };
  }

  return { value: update };
}

async function getCurrentUser(userName) {
  const user = await User.findOne({ userName }).exec();

  if (!user) {
    return { status: 404, body: { message: "Usuario no encontrado" } };
  }

  return { status: 200, body: { user: toPublicUser(user) } };
}

async function updateCurrentUser(userName, payload) {
  const { value, error } = buildEditableUserPayload(payload);

  if (error) {
    return { status: 400, body: { message: error } };
  }

  const user = await User.findOne({ userName }).exec();

  if (!user) {
    return { status: 404, body: { message: "Usuario no encontrado" } };
  }

  if (value.email && value.email !== user.email) {
    const duplicatedEmail = await User.findOne({ email: value.email }).exec();
    if (duplicatedEmail) {
      return { status: 409, body: { message: "Ya existe un usuario con ese email" } };
    }
  }

  Object.assign(user, value);
  await user.save();

  return { status: 200, body: { user: toPublicUser(user) } };
}

module.exports = {
  buildEditableUserPayload,
  getCurrentUser,
  updateCurrentUser,
  isValidProfileImage,
};
