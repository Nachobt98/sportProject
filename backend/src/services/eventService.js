const mongoose = require("mongoose");
const Event = require("../models/Event");
const User = require("../models/User");
const { normalizeString, validateRequiredFields } = require("../utils/strings");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
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

async function createEvent(payload, creatorUserName) {
  const { value, error } = buildEventPayload({
    ...payload,
    creator: creatorUserName,
  });

  if (error) {
    return { status: 400, body: { message: error } };
  }

  const creator = await User.findOne({ userName: value.creator }).exec();
  if (!creator) {
    return { status: 404, body: { message: "Usuario creador no encontrado" } };
  }

  const newEvent = new Event(value);
  await newEvent.save();
  return { status: 201, body: { message: "Evento creado exitosamente", event: newEvent } };
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
    return { status: 404, body: { message: "Usuario no encontrado" } };
  }

  const joinedEvents = await Event.find({ _id: { $in: user.joinedEvents } })
    .sort({ date: 1, _id: 1 })
    .exec();

  return { status: 200, body: joinedEvents };
}

async function joinUserToEvent(eventId, userName) {
  if (!isValidObjectId(eventId)) {
    return { status: 400, body: { message: "El identificador del evento no es valido" } };
  }

  const normalizedUserName = normalizeString(userName);
  if (!normalizedUserName) {
    return { status: 400, body: { message: "El nombre de usuario es requerido" } };
  }

  const [event, user] = await Promise.all([
    Event.findById(eventId).exec(),
    User.findOne({ userName: normalizedUserName }).exec(),
  ]);

  if (!event) {
    return { status: 404, body: { message: "Evento no encontrado" } };
  }
  if (!user) {
    return { status: 404, body: { message: "Usuario no encontrado" } };
  }
  if (event.creator === normalizedUserName) {
    return { status: 400, body: { message: "El creador no puede unirse a su propio evento" } };
  }
  if (event.participantsList.includes(normalizedUserName)) {
    return { status: 409, body: { message: "El usuario ya participa en este evento" } };
  }
  if (event.participantsList.length >= event.participants) {
    return { status: 409, body: { message: "El evento ya no tiene plazas disponibles" } };
  }

  event.participantsList.push(normalizedUserName);
  user.joinedEvents.addToSet(event._id);

  await Promise.all([event.save(), user.save()]);
  return { status: 200, body: { message: "Usuario unido al evento exitosamente", event } };
}

async function cancelUserEvent(eventId, userName) {
  if (!isValidObjectId(eventId)) {
    return { status: 400, body: { message: "El identificador del evento no es valido" } };
  }

  const normalizedUserName = normalizeString(userName);
  if (!normalizedUserName) {
    return { status: 400, body: { message: "El nombre de usuario es requerido" } };
  }

  const [event, user] = await Promise.all([
    Event.findById(eventId).exec(),
    User.findOne({ userName: normalizedUserName }).exec(),
  ]);

  if (!event) {
    return { status: 404, body: { message: "Evento no encontrado" } };
  }
  if (!user) {
    return { status: 404, body: { message: "Usuario no encontrado" } };
  }

  event.participantsList = event.participantsList.filter(
    (participant) => participant !== normalizedUserName
  );
  user.joinedEvents = user.joinedEvents.filter(
    (joinedEventId) => joinedEventId.toString() !== eventId
  );

  await Promise.all([event.save(), user.save()]);
  return { status: 200, body: { message: "Usuario eliminado del evento exitosamente", event } };
}

async function deleteEvent(eventId, authUserName) {
  if (!isValidObjectId(eventId)) {
    return { status: 400, body: { message: "El identificador del evento no es valido" } };
  }

  const event = await Event.findById(eventId).exec();
  if (!event) {
    return { status: 404, body: { message: "Evento no encontrado" } };
  }
  if (event.creator !== authUserName) {
    return { status: 403, body: { message: "Solo el creador puede eliminar este evento" } };
  }

  await Event.findByIdAndDelete(eventId).exec();
  await User.updateMany(
    { joinedEvents: event._id },
    { $pull: { joinedEvents: event._id } }
  ).exec();

  return { status: 200, body: { message: "Evento eliminado correctamente", eventId } };
}

module.exports = {
  createEvent,
  listEvents,
  listCreatedEvents,
  listJoinedEvents,
  joinUserToEvent,
  cancelUserEvent,
  deleteEvent,
};
