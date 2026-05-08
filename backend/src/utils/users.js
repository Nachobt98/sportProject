const { toUserDto } = require("../dtos/userDto");

function toPublicUser(user) {
  return toUserDto(user);
}

module.exports = { toPublicUser };
