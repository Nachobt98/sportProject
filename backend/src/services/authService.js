const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { config } = require("../config/env");

function createSessionToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      userName: user.userName,
    },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
}

async function hashPassword(password) {
  return bcrypt.hash(password, config.passwordHashRounds);
}

async function verifyPassword(candidatePassword, storedPassword) {
  if (!storedPassword) {
    return false;
  }

  if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
    return bcrypt.compare(candidatePassword, storedPassword);
  }

  return candidatePassword === storedPassword;
}

function verifySessionToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = {
  createSessionToken,
  hashPassword,
  verifyPassword,
  verifySessionToken,
};
