const User = require("../models/User");
const { normalizeString } = require("../utils/strings");
const { toPublicUser } = require("../utils/users");
const { logger } = require("../utils/logger");

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

module.exports = { getUser };
