const eventService = require("../services/eventService");
const User = require("../models/User");
const { normalizeString } = require("../utils/strings");

async function createEvent(req, res) {
  try {
    const result = await eventService.createEvent(req.body, req.auth.userName);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al crear el evento" });
  }
}

async function listEvents(req, res) {
  try {
    const events = await eventService.listEvents();
    return res.status(200).json(events);
  } catch (error) {
    console.error(error);
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
    console.error(error);
    return res.status(500).json({ message: "Error al obtener la lista de eventos del usuario" });
  }
}

async function joinEvent(req, res) {
  try {
    const result = await eventService.joinUserToEvent(req.params.eventId, req.auth.userName);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al unir al usuario al evento" });
  }
}

async function joinEventForUser(req, res) {
  try {
    const result = await eventService.joinUserToEvent(req.params.eventId, req.params.userName);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al agregar usuario al evento" });
  }
}

async function cancelEventJoin(req, res) {
  try {
    const result = await eventService.cancelUserEvent(req.params.eventId, req.auth.userName);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al cancelar la participacion" });
  }
}

async function cancelEventJoinForUser(req, res) {
  try {
    const result = await eventService.cancelUserEvent(req.params.eventId, req.params.userName);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al cancelar la participacion" });
  }
}

async function listJoinedEvents(req, res) {
  try {
    const result = await eventService.listJoinedEvents(req.params.userName);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener los eventos unidos del usuario" });
  }
}

async function deleteEvent(req, res) {
  try {
    const result = await eventService.deleteEvent(req.params.eventId, req.auth.userName);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al eliminar el evento" });
  }
}

module.exports = {
  createEvent,
  listEvents,
  listUserEvents,
  joinEvent,
  joinEventForUser,
  cancelEventJoin,
  cancelEventJoinForUser,
  listJoinedEvents,
  deleteEvent,
};
