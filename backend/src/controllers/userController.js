const User = require("../models/User");
const userService = require("../services/userService");
const { normalizeString } = require("../utils/strings");
const { toPublicUser } = require("../utils/users");
const { logger } = require("../utils/logger");

function sendServiceResult(res, result) {
  return res.status(result.status).json(result.body);
}

async function getUser(req, res) {
  const userName = normalizeString(req.params.userName);
  try {
    const user = await User.findOne({ userName }).exec();
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json(toPublicUser(user));
  } catch (error) {
    logger.error("Error al buscar el usuario", error);
    return res.status(500).json({ message: "Error al buscar el usuario" });
  }
}

async function getCurrentUser(req, res) {
  try {
    const result = await userService.getCurrentUser(req.auth.userName);
    return sendServiceResult(res, result);
  } catch (error) {
    logger.error("Error al obtener el usuario actual", error);
    return res.status(500).json({ message: "Error al obtener el usuario actual" });
  }
}

async function updateCurrentUser(req, res) {
  try {
    const result = await userService.updateCurrentUser(req.auth.userName, req.body);
    return sendServiceResult(res, result);
  } catch (error) {
    logger.error("Error al actualizar el usuario actual", error);
    return res.status(500).json({ message: "Error al actualizar el usuario actual" });
  }
}

module.exports = { getUser, getCurrentUser, updateCurrentUser };
