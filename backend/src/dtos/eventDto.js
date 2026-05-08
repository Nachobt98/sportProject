const { serializeId } = require("./userDto");

function serializeUserReference(user) {
  if (!user) {
    return user;
  }

  return user.userName || serializeId(user);
}

function toEventDto(event) {
  if (!event) {
    return null;
  }

  const eventObject = event.toObject ? event.toObject() : event;
  const id = serializeId(eventObject._id);
  const participantsList = eventObject.participantsList || [];

  return {
    ...(id ? { _id: id, id } : {}),
    name: eventObject.name,
    description: eventObject.description,
    sport: eventObject.sport,
    date: eventObject.date,
    locationName: eventObject.locationName,
    location: eventObject.location,
    city: eventObject.city,
    participants: eventObject.participants,
    participantsList: participantsList.map(serializeUserReference),
    creator: serializeUserReference(eventObject.creator),
    createdAt: eventObject.createdAt,
    updatedAt: eventObject.updatedAt,
  };
}

module.exports = { toEventDto, serializeUserReference };
