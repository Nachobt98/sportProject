const express = require("express");
const userController = require("../controllers/userController");
const { authenticateRequest, requireSameUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/users/me", authenticateRequest, userController.getCurrentUser);
router.patch("/users/me", authenticateRequest, userController.updateCurrentUser);
router.get("/user/:userName", authenticateRequest, requireSameUser, userController.getUser);

module.exports = router;
