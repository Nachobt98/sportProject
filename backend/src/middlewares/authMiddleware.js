const { verifySessionToken } = require("../services/authService");

function authenticateRequest(req, res, next) {
  const authorization = req.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Sesion no valida" });
  }

  try {
    req.auth = verifySessionToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: "Sesion no valida" });
  }
}

function requireSameUser(req, res, next) {
  if (req.params.userName && req.params.userName !== req.auth.userName) {
    return res.status(403).json({ message: "No puedes operar sobre otro usuario" });
  }

  return next();
}

module.exports = { authenticateRequest, requireSameUser };
