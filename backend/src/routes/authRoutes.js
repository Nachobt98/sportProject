const express = require("express");
const authController = require("../controllers/authController");
const { authenticateRequest } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/session", authenticateRequest, authController.getSession);

module.exports = router;
