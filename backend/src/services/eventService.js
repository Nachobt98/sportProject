const mongoose = require("mongoose");
const Event = require("../models/Event");
const User = require("../models/User");
const { normalizeString, validateRequiredFields } = require("../utils/strings");

const DEFAULT_EVENT_PAGE = 1;
const DEFAULT_EVENT_LIMIT = 10;
const MAX_EVENT_LIMIT = 50;

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function serviceResponse(status, message, extraBody = {}) {
  return { status, body: { message, ...extraBody } };
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function buildEventPagination(filters = {}) {
  const page = parsePositiveInteger(filters.page, DEFAULT_EVENT_PAGE);
  const requestedLimit = parsePositiveInteger(filters.limit, DEFAULT_EVENT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_EVENT_LIMIT);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function buildPaginationMeta({ page, limit, total }) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

function buildEventFilters(filters = {}) {
  const query = {};
  const city = normalizeString(filters.city);
  const sport = normalizeString(filters.sport);

  if (city) {
    query.city = city;
  }

  if (sport) {
    query.sport = sport;
  }

  if (filters.date) {
    const start = new Date(filters.date);
    if (!Number.isNaN(start.getTime())) {
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }
  }

  return query;
}

function toPublicEvent(event) {
  if (!event) {
    return null;
  }

  const eventObject = event.toObject ? event.toObject() : event;
  const creator = eventObject.creator;
  const participantsList = eventObject.participantsList || [];

  return {
    ...eventObject,
    creator: creator?.userName || creator?.toString?.() || creator,
    participantsList: participantsList.map((participant) =>
      participant?.userName || participant?.toString?.() || participant
    ),
  };
}

function buildEventPayload(payload, creatorId) {
  const missingFields = validateRequiredFields(payload, [
    "name",
    "description",
    "sport",
    "date",
    "locationName",
    "location",
    "city",
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
      creator: creatorId,
      participantsList: [],
    },
  };
}

async function findEventById(eventId) {
  if (!isValidObjectId(eventId)) {
    return serviceResponse(400, "El identificador del evento no es valido");
  }

  const event = await Event.findById(eventId)
    .populate("creator", "userName profileImage")
    .populate("participantsList", "userName profileImage")
    .exec();
  if (!event) {
    return serviceResponse(404, "Evento no encontrado");
  }

  return { status: 200, body: { event: toPublicEvent(event) } };
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

  return { event, user };
}

async function createEvent(payload, creatorUserName) {
  const creator = await User.findOne({ userName: normalizeString(creatorUserName) }).exec();
  if (!creator) {
    return serviceResponse(404, "Usuario creador no encontrado");
  }

  const { value, error } = buildEventPayload(payload, creator._id);

  if (error) {
    return serviceResponse(400, error);
  }

  const newEvent = new Event(value);
  await newEvent.save();
  return serviceResponse(201, "Evento creado exitosamente", { event: toPublicEvent(newEvent) });
}

async function listEvents(filters = {}) {
  const query = buildEventFilters(filters);
  const { page, limit, skip } = buildEventPagination(filters);

  const [events, total] = await Promise.all([
    Event.find(query)
      .sort({ date: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate("creator", "userName profileImage")
      .populate("participantsList", "userName profileImage")
      .exec(),
    Event.countDocuments(query).exec(),
  ]);

  return {
    status: 200,
    body: {
      events: events.map(toPublicEvent),
      pagination: buildPaginationMeta({ page, limit, total }),
    },
  };
}

async function listCreatedEvents(userName) {
  const user = await User.findOne({ userName }).exec();
  if (!user) {
    return [];
  }

  const events = await Event.find({ creator: user._id })
    .sort({ date: 1, _id: 1 })
    .populate("creator", "userName profileImage")
    .populate("participantsList", "userName profileImage")
    .exec();

  return events.map(toPublicEvent);
}

async function listJoinedEvents(userName) {
  const user = await User.findOne({ userName }).exec();
  if (!user) {
    return serviceResponse(404, "Usuario no encontrado");
  }

  const joinedEvents = await Event.find({ _id: { $in: user.joinedEvents } })
    .sort({ date: 1, _id: 1 })
    .populate("creator", "userName profileImage")
    .populate("participantsList", "userName profileImage")
    .exec();

  return { status: 200, body: joinedEvents.map(toPublicEvent) };
}

async function joinUserToEvent(eventId, userName) {
  if (!eventId || !userName) {
    return serviceResponse(400, "Faltan parámetros obligatorios");
  }
  const lookup = await findEventAndUser(eventId, userName);
  if (lookup.status) {
    return lookup;
  }

  const { event, user } = lookup;
  const userId = user._id.toString();

  if (event.creator.toString() === userId) {
    return serviceResponse(400, "El creador no puede unirse a su propio evento");
  }
  if (event.participantsList.some((participantId) => participantId.toString() === userId)) {
    return serviceResponse(409, "El usuario ya participa en este evento");
  }
  if (event.participantsList.length >= event.participants) {
    return serviceResponse(409, "El evento ya no tiene plazas disponibles");
  }

  event.participantsList.push(user._id);
  user.joinedEvents.addToSet(event._id);

  await Promise.all([event.save(), user.save()]);
  const updatedEvent = await Event.findById(event._id)
    .populate("creator", "userName profileImage")
    .populate("participantsList", "userName profileImage")
    .exec();
  return serviceResponse(200, "Usuario unido al evento exitosamente", { event: toPublicEvent(updatedEvent) });
}

async function cancelUserEvent(eventId, userName) {
  const lookup = await findEventAndUser(eventId, userName);
  if (lookup.status) {
    return lookup;
  }

  const { event, user } = lookup;
  const userId = user._id.toString();

  event.participantsList = event.participantsList.filter(
    (participantId) => participantId.toString() !== userId
  );
  user.joinedEvents = user.joinedEvents.filter(
    (joinedEventId) => joinedEventId.toString() !== eventId
  );

  await Promise.all([event.save(), user.save()]);
  const updatedEvent = await Event.findById(event._id)
    .populate("creator", "userName profileImage")
    .populate("participantsList", "userName profileImage")
    .exec();
  return serviceResponse(200, "Usuario eliminado del evento exitosamente", { event: toPublicEvent(updatedEvent) });
}

async function deleteEvent(eventId, authUserName) {
  const lookup = await findEventAndUser(eventId, authUserName);
  if (lookup.status) {
    return lookup;
  }

  const { event, user } = lookup;
  if (event.creator.toString() !== user._id.toString()) {
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
  buildEventFilters,
  buildEventPagination,
  buildEventPayload,
  toPublicEvent,
  findEventById,
  createEvent,
  listEvents,
  listCreatedEvents,
  listJoinedEvents,
  joinUserToEvent,
  cancelUserEvent,
  deleteEvent,
};
