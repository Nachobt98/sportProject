const express = require("express");
const userController = require("../controllers/userController");
const { authenticateRequest, requireSameUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/user/:userName", authenticateRequest, requireSameUser, userController.getUser);

module.exports = router;
