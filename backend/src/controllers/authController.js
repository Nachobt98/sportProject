const User = require("../models/User");
const { createSessionToken, hashPassword, verifyPassword } = require("../services/authService");
const { buildErrorBody, ERROR_CODES } = require("../utils/apiResponses");
const { normalizeString, validateRequiredFields } = require("../utils/strings");
const { isValidEmail, isValidPassword, parseOptionalDate } = require("../utils/validators");
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
      return res.status(400).json(buildErrorBody(
        `Faltan campos obligatorios: ${missingFields.join(", ")}`,
        ERROR_CODES.VALIDATION_ERROR,
        { fields: missingFields }
      ));
    }

    if (!isValidEmail(req.body.email)) {
      return res.status(400).json(buildErrorBody(
        "El email no tiene un formato valido",
        ERROR_CODES.VALIDATION_ERROR,
        { field: "email" }
      ));
    }

    if (!isValidPassword(req.body.password)) {
      return res.status(400).json(buildErrorBody(
        "El password debe tener al menos 8 caracteres",
        ERROR_CODES.VALIDATION_ERROR,
        { field: "password" }
      ));
    }

    const birthdateResult = parseOptionalDate(req.body.birthdate);
    if (birthdateResult.error) {
      return res.status(400).json(buildErrorBody(
        "La fecha de nacimiento no es valida",
        ERROR_CODES.VALIDATION_ERROR,
        { field: "birthdate" }
      ));
    }

    const userName = normalizeString(req.body.userName);
    const email = normalizeString(req.body.email).toLowerCase();
    const existingUser = await User.findOne({ $or: [{ userName }, { email }] }).exec();

    if (existingUser) {
      return res.status(409).json(buildErrorBody(
        "Ya existe un usuario con ese usuario o email",
        ERROR_CODES.DUPLICATE_USER
      ));
    }

    const newUser = new User({
      firstName: normalizeString(req.body.firstName),
      lastName: normalizeString(req.body.lastName),
      userName,
      city: normalizeString(req.body.city),
      email,
      birthdate: birthdateResult.value,
      profileImage: "",
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
    return res.status(500).json(buildErrorBody(
      "Error al registrar el usuario",
      ERROR_CODES.INTERNAL_ERROR
    ));
  }
}

async function login(req, res) {
  const userName = normalizeString(req.body.userName);
  const { password } = req.body;

  if (!userName || !password) {
    return res.status(400).json(buildErrorBody(
      "Usuario y password son requeridos",
      ERROR_CODES.AUTH_MISSING_CREDENTIALS
    ));
  }

  try {
    const user = await User.findOne({ userName }).exec();
    if (!user) {
      return res.status(401).json(buildErrorBody(
        "Credenciales no validas",
        ERROR_CODES.AUTH_INVALID_CREDENTIALS
      ));
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json(buildErrorBody(
        "Credenciales no validas",
        ERROR_CODES.AUTH_INVALID_CREDENTIALS
      ));
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
    return res.status(500).json(buildErrorBody(
      "Error al iniciar sesion",
      ERROR_CODES.INTERNAL_ERROR
    ));
  }
}

async function getSession(req, res) {
  try {
    const user = await User.findOne({ userName: req.auth.userName }).exec();
    if (!user) {
      return res.status(404).json(buildErrorBody(
        "Usuario no encontrado",
        ERROR_CODES.USER_NOT_FOUND
      ));
    }

    return res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    logger.error("Error al validar la sesion", error);
    return res.status(500).json(buildErrorBody(
      "Error al validar la sesion",
      ERROR_CODES.INTERNAL_ERROR
    ));
  }
}

module.exports = { register, login, getSession };
