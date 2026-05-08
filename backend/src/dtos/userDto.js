function serializeId(value) {
  return value?.toString?.() || value;
}

function serializeIdList(values = []) {
  return values.map(serializeId);
}

function toUserDto(user) {
  if (!user) {
    return null;
  }

  const userObject = user.toObject ? user.toObject() : user;
  const id = serializeId(userObject._id);

  return {
    ...(id ? { _id: id, id } : {}),
    firstName: userObject.firstName,
    lastName: userObject.lastName,
    userName: userObject.userName,
    city: userObject.city,
    email: userObject.email,
    birthdate: userObject.birthdate,
    profileImage: userObject.profileImage,
    joinedEvents: serializeIdList(userObject.joinedEvents || []),
    createdAt: userObject.createdAt,
    updatedAt: userObject.updatedAt,
  };
}

module.exports = { toUserDto, serializeId };
