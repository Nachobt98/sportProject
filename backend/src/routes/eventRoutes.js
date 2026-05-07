const express = require("express");
const eventController = require("../controllers/eventController");
const { authenticateRequest, requireSameUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/events", authenticateRequest, eventController.listEvents);
router.post("/events", authenticateRequest, eventController.createEvent);
router.delete("/events/:eventId", authenticateRequest, eventController.deleteEvent);

router.post("/events/:eventId/join", authenticateRequest, eventController.joinEvent);
router.delete("/events/:eventId/join", authenticateRequest, eventController.cancelEventJoin);

// Legacy endpoints kept for backwards compatibility while the frontend migrates.
router.post(
  "/events/:eventId/participants/:userName",
  authenticateRequest,
  requireSameUser,
  eventController.joinEventForUser
);
router.post(
  "/user/:userName/joinEvent/:eventId",
  authenticateRequest,
  requireSameUser,
  eventController.joinEventForUser
);
router.delete(
  "/events/:eventId/join/:userName",
  authenticateRequest,
  requireSameUser,
  eventController.cancelEventJoinForUser
);
router.delete(
  "/events/:eventId/participants/:userName",
  authenticateRequest,
  requireSameUser,
  eventController.cancelEventJoinForUser
);
router.delete(
  "/user/:userName/events/:eventId",
  authenticateRequest,
  requireSameUser,
  eventController.cancelEventJoinForUser
);

router.get(
  "/user/:userName/events",
  authenticateRequest,
  requireSameUser,
  eventController.listUserEvents
);
router.get(
  "/user/:userName/joinedEvents",
  authenticateRequest,
  requireSameUser,
  eventController.listJoinedEvents
);

module.exports = router;
