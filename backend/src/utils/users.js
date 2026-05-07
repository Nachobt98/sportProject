function toPublicUser(user) {
  if (!user) {
    return null;
  }

  const userObject = user.toObject ? user.toObject() : user;
  const { password, ...publicUser } = userObject;
  return publicUser;
}

module.exports = { toPublicUser };
