const express = require("express");
const authController = require("../controllers/authController");
const { authenticateRequest } = require("../middlewares/authMiddleware");
const { authLimiter } = require("../middlewares/securityMiddleware");

const router = express.Router();

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.get("/session", authenticateRequest, authController.getSession);

module.exports = router;
