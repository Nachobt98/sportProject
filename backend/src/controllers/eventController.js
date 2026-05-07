const eventService = require("../services/eventService");
const User = require("../models/User");
const { normalizeString } = require("../utils/strings");
const { logger } = require("../utils/logger");

function sendServiceResult(res, result) {
  return res.status(result.status).json(result.body);
}

function getAuthenticatedUserName(req) {
  return req.auth.userName;
}

function createServiceHandler(serviceCall, errorMessage) {
  return async function handleServiceRequest(req, res) {
    try {
      const result = await serviceCall(req);
      return sendServiceResult(res, result);
    } catch (error) {
      logger.error(errorMessage, error);
      return res.status(500).json({ message: errorMessage });
    }
  };
}

async function createEvent(req, res) {
  try {
    const result = await eventService.createEvent(req.body, getAuthenticatedUserName(req));
    return sendServiceResult(res, result);
  } catch (error) {
    logger.error("Error al crear el evento", error);
    return res.status(500).json({ message: "Error al crear el evento" });
  }
}

async function listEvents(req, res) {
  try {
    const events = await eventService.listEvents();
    return res.status(200).json(events);
  } catch (error) {
    logger.error("Error al obtener la lista de eventos", error);
    return res.status(500).json({ message: "Error al obtener la lista de eventos" });
  }
}

async function listUserEvents(req, res) {
  const userName = normalizeString(req.params.userName);
  try {
    const user = await User.findOne({ userName }).exec();
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const userEvents = await eventService.listCreatedEvents(userName);
    return res.status(200).json(userEvents);
  } catch (error) {
    logger.error("Error al obtener la lista de eventos del usuario", error);
    return res.status(500).json({ message: "Error al obtener la lista de eventos del usuario" });
  }
}

async function listCurrentUserEvents(req, res) {
  try {
    const events = await eventService.listCreatedEvents(getAuthenticatedUserName(req));
    return res.status(200).json(events);
  } catch (error) {
    logger.error("Error al obtener la lista de eventos del usuario", error);
    return res.status(500).json({ message: "Error al obtener la lista de eventos del usuario" });
  }
}

const listCurrentUserJoinedEvents = createServiceHandler(
  (req) => eventService.listJoinedEvents(getAuthenticatedUserName(req)),
  "Error al obtener los eventos unidos del usuario"
);

const getEventById = createServiceHandler(
  (req) => eventService.findEventById(req.params.eventId),
  "Error al obtener el evento"
);

const joinEvent = createServiceHandler(
  (req) => eventService.joinUserToEvent(req.params.eventId, getAuthenticatedUserName(req)),
  "Error al unir al usuario al evento"
);

const cancelEventJoin = createServiceHandler(
  (req) => eventService.cancelUserEvent(req.params.eventId, getAuthenticatedUserName(req)),
  "Error al cancelar la participacion"
);

const listJoinedEvents = createServiceHandler(
  (req) => eventService.listJoinedEvents(req.params.userName),
  "Error al obtener los eventos unidos del usuario"
);

const deleteEvent = createServiceHandler(
  (req) => eventService.deleteEvent(req.params.eventId, getAuthenticatedUserName(req)),
  "Error al eliminar el evento"
);

module.exports = {
  createEvent,
  listEvents,
  listUserEvents,
  listCurrentUserEvents,
  listCurrentUserJoinedEvents,
  getEventById,
  joinEvent,
  cancelEventJoin,
  listJoinedEvents,
  deleteEvent,
};
