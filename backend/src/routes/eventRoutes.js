const express = require("express");
const eventController = require("../controllers/eventController");
const { authenticateRequest, requireSameUser } = require("../middlewares/authMiddleware");

const router = express.Router();
const authenticated = [authenticateRequest];
const sameUser = [authenticateRequest, requireSameUser];

router.get("/events", ...authenticated, eventController.listEvents);
router.post("/events", ...authenticated, eventController.createEvent);
router.get("/events/:eventId", ...authenticated, eventController.getEventById);
router.delete("/events/:eventId", ...authenticated, eventController.deleteEvent);

router.post("/events/:eventId/join", ...authenticated, eventController.joinEvent);
router.delete("/events/:eventId/join", ...authenticated, eventController.cancelEventJoin);

router.get("/users/me/events", ...authenticated, eventController.listCurrentUserEvents);
router.get("/users/me/joined-events", ...authenticated, eventController.listCurrentUserJoinedEvents);

router.get("/user/:userName/events", ...sameUser, eventController.listUserEvents);
router.get("/user/:userName/joinedEvents", ...sameUser, eventController.listJoinedEvents);

module.exports = router;
