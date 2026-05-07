const User = require("../models/User");
const { createSessionToken, hashPassword, verifyPassword } = require("../services/authService");
const { isValidProfileImage } = require("../services/userService");
const { normalizeString, validateRequiredFields } = require("../utils/strings");
const { toPublicUser } = require("../utils/users");
const { logger } = require("../utils/logger");

async function register(req, res) {
  try {
    const missingFields = validateRequiredFields(req.body, [
      "firstName",
      "lastName",
      "userName",
      "email",
      "password",
    ]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Faltan campos obligatorios: ${missingFields.join(", ")}`,
      });
    }

    if (!isValidProfileImage(req.body.profileImage)) {
      return res.status(400).json({ message: "La imagen de perfil no es valida o es demasiado grande" });
    }

    const userName = normalizeString(req.body.userName);
    const email = normalizeString(req.body.email);
    const existingUser = await User.findOne({ $or: [{ userName }, { email }] }).exec();

    if (existingUser) {
      return res.status(409).json({ message: "Ya existe un usuario con ese usuario o email" });
    }

    const newUser = new User({
      firstName: normalizeString(req.body.firstName),
      lastName: normalizeString(req.body.lastName),
      userName,
      city: normalizeString(req.body.city),
      email,
      birthdate: req.body.birthdate || undefined,
      profileImage: req.body.profileImage || "",
      password: await hashPassword(req.body.password),
      joinedEvents: [],
    });

    await newUser.save();
    return res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: toPublicUser(newUser),
      token: createSessionToken(newUser),
    });
  } catch (error) {
    logger.error("Error al registrar el usuario", error);
    return res.status(500).json({ message: "Error al registrar el usuario" });
  }
}

async function login(req, res) {
  const userName = normalizeString(req.body.userName);
  const { password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ message: "Usuario y password son requeridos" });
  }

  try {
    const user = await User.findOne({ userName }).exec();
    if (!user) {
      return res.status(401).json({ message: "Credenciales no validas" });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciales no validas" });
    }

    if (!user.password.startsWith("$2a$") && !user.password.startsWith("$2b$")) {
      user.password = await hashPassword(password);
      await user.save();
    }

    return res.status(200).json({
      message: "Inicio de sesion exitoso",
      username: user.userName,
      user: toPublicUser(user),
      token: createSessionToken(user),
    });
  } catch (error) {
    logger.error("Error al iniciar sesion", error);
    return res.status(500).json({ message: "Error al iniciar sesion" });
  }
}

async function getSession(req, res) {
  try {
    const user = await User.findOne({ userName: req.auth.userName }).exec();
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    logger.error("Error al validar la sesion", error);
    return res.status(500).json({ message: "Error al validar la sesion" });
  }
}

module.exports = { register, login, getSession };
