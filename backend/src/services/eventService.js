const mongoose = require("mongoose");
const Event = require("../models/Event");
const User = require("../models/User");
const { EVENT_STATUS, getEffectiveEventStatus, toEventDto } = require("../dtos/eventDto");
const { ERROR_CODES, serviceResponse } = require("../utils/apiResponses");
const { normalizeString, validateRequiredFields } = require("../utils/strings");

const DEFAULT_EVENT_PAGE = 1;
const DEFAULT_EVENT_LIMIT = 10;
const MAX_EVENT_LIMIT = 50;

const EVENT_REQUIRED_FIELDS = [
  "name",
  "description",
  "sport",
  "date",
  "locationName",
  "location",
  "city",
];

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function getReferenceId(reference) {
  return reference?._id || reference;
}

function idsMatch(left, right) {
  const leftId = getReferenceId(left);
  const rightId = getReferenceId(right);
  return leftId?.toString() === rightId?.toString();
}

function includesId(values = [], expectedId) {
  return values.some((value) => idsMatch(value, expectedId));
}

function canViewEvent(event, user) {
  const status = getEffectiveEventStatus(event);

  if (status === EVENT_STATUS.OPEN || status === EVENT_STATUS.FULL) {
    return true;
  }

  if (!user || includesId(event.dismissedBy, user._id)) {
    return false;
  }

  return idsMatch(event.creator, user._id) || includesId(event.participantsList, user._id);
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

function buildFutureDateQuery(dateQuery, now = new Date()) {
  if (!dateQuery) {
    return { $gte: now };
  }

  return {
    ...dateQuery,
    $gte: dateQuery.$gte && dateQuery.$gte > now ? dateQuery.$gte : now,
  };
}

function buildPublicEventQuery(filters = {}, user) {
  const query = buildEventFilters(filters);
  return {
    ...query,
    status: EVENT_STATUS.OPEN,
    date: buildFutureDateQuery(query.date),
    ...(user?._id ? { dismissedBy: { $ne: user._id } } : {}),
  };
}

function buildEditableEventPayload(payload) {
  const missingFields = validateRequiredFields(payload, EVENT_REQUIRED_FIELDS);

  if (missingFields.length > 0) {
    return { error: `Faltan campos obligatorios: ${missingFields.join(", ")}`, code: ERROR_CODES.VALIDATION_ERROR };
  }

  const eventDate = new Date(payload.date);
  if (Number.isNaN(eventDate.getTime())) {
    return { error: "La fecha del evento no es valida", code: ERROR_CODES.VALIDATION_ERROR };
  }

  const participants = Number(payload.participants);
  if (!Number.isInteger(participants) || participants < 1) {
    return { error: "El numero de participantes debe ser mayor que cero", code: ERROR_CODES.VALIDATION_ERROR };
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
    },
  };
}

function buildEventPayload(payload, creatorId) {
  const { value, error, code } = buildEditableEventPayload(payload);

  if (error) {
    return { error, code };
  }

  return {
    value: {
      ...value,
      creator: creatorId,
      participantsList: [],
      dismissedBy: [],
      status: EVENT_STATUS.OPEN,
    },
  };
}

async function getUserByName(userName) {
  const normalizedUserName = normalizeString(userName);
  if (!normalizedUserName) {
    return null;
  }

  return User.findOne({ userName: normalizedUserName }).exec();
}

async function findEventById(eventId, authUserName = "") {
  if (!isValidObjectId(eventId)) {
    return serviceResponse(400, "El identificador del evento no es valido", {}, ERROR_CODES.INVALID_EVENT_ID);
  }

  const [event, user] = await Promise.all([
    Event.findById(eventId)
      .populate("creator", "userName profileImage")
      .populate("participantsList", "userName profileImage")
      .populate("dismissedBy", "userName profileImage")
      .exec(),
    getUserByName(authUserName),
  ]);

  if (!event || !canViewEvent(event, user)) {
    return serviceResponse(404, "Evento no encontrado", {}, ERROR_CODES.EVENT_NOT_FOUND);
  }

  return { status: 200, body: { event: toEventDto(event) } };
}

async function findEventAndUser(eventId, userName) {
  if (!isValidObjectId(eventId)) {
    return serviceResponse(400, "El identificador del evento no es valido", {}, ERROR_CODES.INVALID_EVENT_ID);
  }

  const normalizedUserName = normalizeString(userName);
  if (!normalizedUserName) {
    return serviceResponse(400, "El nombre de usuario es requerido", {}, ERROR_CODES.VALIDATION_ERROR);
  }

  const [event, user] = await Promise.all([
    Event.findById(eventId).exec(),
    User.findOne({ userName: normalizedUserName }).exec(),
  ]);

  if (!event) {
    return serviceResponse(404, "Evento no encontrado", {}, ERROR_CODES.EVENT_NOT_FOUND);
  }

  if (!user) {
    return serviceResponse(404, "Usuario no encontrado", {}, ERROR_CODES.USER_NOT_FOUND);
  }

  return { event, user };
}

async function createEvent(payload, creatorUserName) {
  const creator = await getUserByName(creatorUserName);
  if (!creator) {
    return serviceResponse(404, "Usuario creador no encontrado", {}, ERROR_CODES.USER_NOT_FOUND);
  }

  const { value, error, code } = buildEventPayload(payload, creator._id);

  if (error) {
    return serviceResponse(400, error, {}, code);
  }

  const newEvent = new Event(value);
  await newEvent.save();
  return serviceResponse(201, "Evento creado exitosamente", { event: toEventDto(newEvent) });
}

async function listEvents(filters = {}, authUserName = "") {
  const user = await getUserByName(authUserName);
  const query = buildPublicEventQuery(filters, user);
  const { page, limit, skip } = buildEventPagination(filters);

  const [events, total] = await Promise.all([
    Event.find(query)
      .sort({ date: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate("creator", "userName profileImage")
      .populate("participantsList", "userName profileImage")
      .populate("dismissedBy", "userName profileImage")
      .exec(),
    Event.countDocuments(query).exec(),
  ]);

  return {
    status: 200,
    body: {
      events: events.map((event) => toEventDto(event)),
      pagination: buildPaginationMeta({ page, limit, total }),
    },
  };
}

async function listCreatedEvents(userName) {
  const user = await getUserByName(userName);
  if (!user) {
    return [];
  }

  const events = await Event.find({ creator: user._id, dismissedBy: { $ne: user._id } })
    .sort({ date: 1, _id: 1 })
    .populate("creator", "userName profileImage")
    .populate("participantsList", "userName profileImage")
    .populate("dismissedBy", "userName profileImage")
    .exec();

  return events.map((event) => toEventDto(event));
}

async function listJoinedEvents(userName) {
  const user = await getUserByName(userName);
  if (!user) {
    return serviceResponse(404, "Usuario no encontrado", {}, ERROR_CODES.USER_NOT_FOUND);
  }

  const joinedEvents = await Event.find({ _id: { $in: user.joinedEvents }, dismissedBy: { $ne: user._id } })
    .sort({ date: 1, _id: 1 })
    .populate("creator", "userName profileImage")
    .populate("participantsList", "userName profileImage")
    .populate("dismissedBy", "userName profileImage")
    .exec();

  return { status: 200, body: joinedEvents.map((event) => toEventDto(event)) };
}

async function joinUserToEvent(eventId, userName) {
  if (!eventId || !userName) {
    return serviceResponse(400, "Faltan parametros obligatorios", {}, ERROR_CODES.VALIDATION_ERROR);
  }
  const lookup = await findEventAndUser(eventId, userName);
  if (lookup.status) {
    return lookup;
  }

  const { event, user } = lookup;
  const userId = user._id.toString();
  const status = getEffectiveEventStatus(event);

  if (status !== EVENT_STATUS.OPEN) {
    return serviceResponse(409, "El evento no acepta nuevas inscripciones", {}, ERROR_CODES.EVENT_FULL);
  }
  if (event.creator.toString() === userId) {
    return serviceResponse(400, "El creador no puede unirse a su propio evento", {}, ERROR_CODES.EVENT_CREATOR_CANNOT_JOIN);
  }
  if (includesId(event.participantsList, user._id)) {
    return serviceResponse(409, "El usuario ya participa en este evento", {}, ERROR_CODES.EVENT_ALREADY_JOINED);
  }
  if (includesId(event.dismissedBy, user._id)) {
    event.dismissedBy = event.dismissedBy.filter((dismissedUserId) => !idsMatch(dismissedUserId, user._id));
  }

  event.participantsList.push(user._id);
  user.joinedEvents.addToSet(event._id);

  await Promise.all([event.save(), user.save()]);
  const updatedEvent = await Event.findById(event._id)
    .populate("creator", "userName profileImage")
    .populate("participantsList", "userName profileImage")
    .populate("dismissedBy", "userName profileImage")
    .exec();
  return serviceResponse(200, "Usuario unido al evento exitosamente", { event: toEventDto(updatedEvent) });
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
    .populate("dismissedBy", "userName profileImage")
    .exec();
  return serviceResponse(200, "Usuario eliminado del evento exitosamente", { event: toEventDto(updatedEvent) });
}

async function updateEvent(eventId, payload, authUserName) {
  const lookup = await findEventAndUser(eventId, authUserName);
  if (lookup.status) {
    return lookup;
  }

  const { event, user } = lookup;
  if (event.creator.toString() !== user._id.toString()) {
    return serviceResponse(403, "Solo el creador puede editar este evento", {}, ERROR_CODES.EVENT_FORBIDDEN);
  }

  if (event.status === EVENT_STATUS.CANCELLED) {
    return serviceResponse(409, "No se puede editar un evento cancelado", {}, ERROR_CODES.EVENT_FORBIDDEN);
  }

  const { value, error, code } = buildEditableEventPayload(payload);
  if (error) {
    return serviceResponse(400, error, {}, code);
  }

  if (value.participants < event.participantsList.length) {
    return serviceResponse(
      400,
      "El numero de participantes no puede ser menor que los usuarios ya unidos",
      {},
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  Object.assign(event, value, { status: EVENT_STATUS.OPEN });
  await event.save();

  const updatedEvent = await Event.findById(event._id)
    .populate("creator", "userName profileImage")
    .populate("participantsList", "userName profileImage")
    .populate("dismissedBy", "userName profileImage")
    .exec();

  return serviceResponse(200, "Evento actualizado correctamente", { event: toEventDto(updatedEvent) });
}

async function cancelEvent(eventId, authUserName) {
  const lookup = await findEventAndUser(eventId, authUserName);
  if (lookup.status) {
    return lookup;
  }

  const { event, user } = lookup;
  if (event.creator.toString() !== user._id.toString()) {
    return serviceResponse(403, "Solo el creador puede cancelar este evento", {}, ERROR_CODES.EVENT_FORBIDDEN);
  }

  event.status = EVENT_STATUS.CANCELLED;
  await event.save();

  const updatedEvent = await Event.findById(event._id)
    .populate("creator", "userName profileImage")
    .populate("participantsList", "userName profileImage")
    .populate("dismissedBy", "userName profileImage")
    .exec();

  return serviceResponse(200, "Evento cancelado correctamente", { event: toEventDto(updatedEvent) });
}

async function dismissEventForUser(eventId, authUserName) {
  const lookup = await findEventAndUser(eventId, authUserName);
  if (lookup.status) {
    return lookup;
  }

  const { event, user } = lookup;
  const status = getEffectiveEventStatus(event);
  const canDismiss = status === EVENT_STATUS.CANCELLED || status === EVENT_STATUS.PAST || event.creator.toString() === user._id.toString();

  if (!canDismiss) {
    return serviceResponse(409, "Solo se pueden ocultar eventos cancelados, pasados o propios", {}, ERROR_CODES.EVENT_FORBIDDEN);
  }

  event.dismissedBy.addToSet(user._id);
  await event.save();

  return serviceResponse(200, "Evento ocultado para el usuario correctamente", { eventId });
}

async function deleteEvent(eventId, authUserName) {
  const lookup = await findEventAndUser(eventId, authUserName);
  if (lookup.status) {
    return lookup;
  }

  const { event, user } = lookup;
  if (event.creator.toString() !== user._id.toString()) {
    return serviceResponse(403, "Solo el creador puede eliminar este evento", {}, ERROR_CODES.EVENT_FORBIDDEN);
  }

  await Event.findByIdAndDelete(eventId).exec();
  await User.updateMany(
    { joinedEvents: event._id },
    { $pull: { joinedEvents: event._id } }
  ).exec();

  return serviceResponse(200, "Evento eliminado correctamente", { eventId });
}

module.exports = {
  EVENT_STATUS,
  buildEventFilters,
  buildFutureDateQuery,
  buildPublicEventQuery,
  buildEventPagination,
  buildEditableEventPayload,
  buildEventPayload,
  canViewEvent,
  findEventById,
  createEvent,
  listEvents,
  listCreatedEvents,
  listJoinedEvents,
  joinUserToEvent,
  cancelUserEvent,
  updateEvent,
  cancelEvent,
  dismissEventForUser,
  deleteEvent,
};
