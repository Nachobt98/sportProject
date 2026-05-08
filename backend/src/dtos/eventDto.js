const { serializeId } = require("./userDto");

const EVENT_STATUS = {
  OPEN: "open",
  FULL: "full",
  CANCELLED: "cancelled",
  PAST: "past",
};

function serializeUserReference(user) {
  if (!user) {
    return user;
  }

  return user.userName || serializeId(user);
}

function isPastEventDate(date, now = new Date()) {
  const eventDate = new Date(date);
  return !Number.isNaN(eventDate.getTime()) && eventDate < now;
}

function getEffectiveEventStatus(eventObject, now = new Date()) {
  if (eventObject.status === EVENT_STATUS.CANCELLED) {
    return EVENT_STATUS.CANCELLED;
  }

  if (isPastEventDate(eventObject.date, now)) {
    return EVENT_STATUS.PAST;
  }

  const participantsList = eventObject.participantsList || [];
  if (participantsList.length >= Number(eventObject.participants || 0)) {
    return EVENT_STATUS.FULL;
  }

  return EVENT_STATUS.OPEN;
}

function toEventDto(event, options = {}) {
  if (!event) {
    return null;
  }

  const eventObject = event.toObject ? event.toObject() : event;
  const id = serializeId(eventObject._id);
  const participantsList = eventObject.participantsList || [];
  const dismissedBy = eventObject.dismissedBy || [];
  const effectiveStatus = getEffectiveEventStatus(eventObject, options.now);

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
    status: effectiveStatus,
    baseStatus: eventObject.status || EVENT_STATUS.OPEN,
    dismissedBy: dismissedBy.map(serializeUserReference),
    canJoin: effectiveStatus === EVENT_STATUS.OPEN,
    isLocked: effectiveStatus !== EVENT_STATUS.OPEN,
    createdAt: eventObject.createdAt,
    updatedAt: eventObject.updatedAt,
  };
}

module.exports = {
  EVENT_STATUS,
  getEffectiveEventStatus,
  isPastEventDate,
  toEventDto,
  serializeUserReference,
};
