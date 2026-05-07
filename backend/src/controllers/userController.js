const userService = require("../services/userService");
const { logger } = require("../utils/logger");

function sendServiceResult(res, result) {
  return res.status(result.status).json(result.body);
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

module.exports = { getCurrentUser, updateCurrentUser };
