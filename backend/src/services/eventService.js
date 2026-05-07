const mongoose = require("mongoose");
const Event = require("../models/Event");
const User = require("../models/User");
const { normalizeString, validateRequiredFields } = require("../utils/strings");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function serviceResponse(status, message, extraBody = {}) {
  return { status, body: { message, ...extraBody } };
}

function buildEventPayload(payload) {
  const missingFields = validateRequiredFields(payload, [
    "name",
    "description",
    "sport",
    "date",
    "locationName",
    "location",
    "city",
    "creator",
  ]);

  if (missingFields.length > 0) {
    return { error: `Faltan campos obligatorios: ${missingFields.join(", ")}` };
  }

  const eventDate = new Date(payload.date);
  if (Number.isNaN(eventDate.getTime())) {
    return { error: "La fecha del evento no es valida" };
  }

  const participants = Number(payload.participants);
  if (!Number.isInteger(participants) || participants < 1) {
    return { error: "El numero de participantes debe ser mayor que cero" };
  }

  return {
    value: {
      name: normalizeString(payload.name),
      description: normalizeString(payload.description),
      sport: normalizeString(payload.sport),
      date: eventDate,
      locationName: normalizeString(payload.locationName),
      location: normalizeString(payload.location),
      city: normalizeString(payload.city),
      participants,
      creator: normalizeString(payload.creator),
      participantsList: [],
    },
  };
}

async function findEventAndUser(eventId, userName) {
  if (!isValidObjectId(eventId)) {
    return serviceResponse(400, "El identificador del evento no es valido");
  }

  const normalizedUserName = normalizeString(userName);
  if (!normalizedUserName) {
    return serviceResponse(400, "El nombre de usuario es requerido");
  }

  const [event, user] = await Promise.all([
    Event.findById(eventId).exec(),
    User.findOne({ userName: normalizedUserName }).exec(),
  ]);

  if (!event) {
    return serviceResponse(404, "Evento no encontrado");
  }

  if (!user) {
    return serviceResponse(404, "Usuario no encontrado");
  }

  return { event, user, userName: normalizedUserName };
}

async function createEvent(payload, creatorUserName) {
  const { value, error } = buildEventPayload({
    ...payload,
    creator: creatorUserName,
  });

  if (error) {
    return serviceResponse(400, error);
  }

  const creator = await User.findOne({ userName: value.creator }).exec();
  if (!creator) {
    return serviceResponse(404, "Usuario creador no encontrado");
  }

  const newEvent = new Event(value);
  await newEvent.save();
  return serviceResponse(201, "Evento creado exitosamente", { event: newEvent });
}

async function listEvents() {
  return Event.find().sort({ date: 1, _id: 1 }).exec();
}

async function listCreatedEvents(userName) {
  return Event.find({ creator: userName }).sort({ date: 1, _id: 1 }).exec();
}

async function listJoinedEvents(userName) {
  const user = await User.findOne({ userName }).exec();
  if (!user) {
    return serviceResponse(404, "Usuario no encontrado");
  }

  const joinedEvents = await Event.find({ _id: { $in: user.joinedEvents } })
    .sort({ date: 1, _id: 1 })
    .exec();

  return { status: 200, body: joinedEvents };
}

async function joinUserToEvent(eventId, userName) {
  const lookup = await findEventAndUser(eventId, userName);
  if (lookup.status) {
    return lookup;
  }

  const { event, user, userName: normalizedUserName } = lookup;

  if (event.creator === normalizedUserName) {
    return serviceResponse(400, "El creador no puede unirse a su propio evento");
  }
  if (event.participantsList.includes(normalizedUserName)) {
    return serviceResponse(409, "El usuario ya participa en este evento");
  }
  if (event.participantsList.length >= event.participants) {
    return serviceResponse(409, "El evento ya no tiene plazas disponibles");
  }

  event.participantsList.push(normalizedUserName);
  user.joinedEvents.addToSet(event._id);

  await Promise.all([event.save(), user.save()]);
  return serviceResponse(200, "Usuario unido al evento exitosamente", { event });
}

async function cancelUserEvent(eventId, userName) {
  const lookup = await findEventAndUser(eventId, userName);
  if (lookup.status) {
    return lookup;
  }

  const { event, user, userName: normalizedUserName } = lookup;

  event.participantsList = event.participantsList.filter(
    (participant) => participant !== normalizedUserName
  );
  user.joinedEvents = user.joinedEvents.filter(
    (joinedEventId) => joinedEventId.toString() !== eventId
  );

  await Promise.all([event.save(), user.save()]);
  return serviceResponse(200, "Usuario eliminado del evento exitosamente", { event });
}

async function deleteEvent(eventId, authUserName) {
  if (!isValidObjectId(eventId)) {
    return serviceResponse(400, "El identificador del evento no es valido");
  }

  const event = await Event.findById(eventId).exec();
  if (!event) {
    return serviceResponse(404, "Evento no encontrado");
  }
  if (event.creator !== authUserName) {
    return serviceResponse(403, "Solo el creador puede eliminar este evento");
  }

  await Event.findByIdAndDelete(eventId).exec();
  await User.updateMany(
    { joinedEvents: event._id },
    { $pull: { joinedEvents: event._id } }
  ).exec();

  return serviceResponse(200, "Evento eliminado correctamente", { eventId });
}

module.exports = {
  buildEventPayload,
  createEvent,
  listEvents,
  listCreatedEvents,
  listJoinedEvents,
  joinUserToEvent,
  cancelUserEvent,
  deleteEvent,
};
