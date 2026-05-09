const express = require("express");
const userController = require("../controllers/userController");
const { authenticateRequest } = require("../middlewares/authMiddleware");
const { handleProfileImageUpload } = require("../middlewares/profileImageUploadMiddleware");

const router = express.Router();

router.get("/users/me", authenticateRequest, userController.getCurrentUser);
router.patch("/users/me", authenticateRequest, userController.updateCurrentUser);
router.post("/users/me/profile-image", authenticateRequest, handleProfileImageUpload, userController.updateCurrentUserProfileImage);

module.exports = router;
