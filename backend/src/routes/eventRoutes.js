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

const legacyJoinRoutes = [
  "/events/:eventId/participants/:userName",
  "/user/:userName/joinEvent/:eventId",
];
legacyJoinRoutes.forEach((path) => {
  router.post(path, ...sameUser, eventController.joinEventForUser);
});

const legacyCancelRoutes = [
  "/events/:eventId/join/:userName",
  "/events/:eventId/participants/:userName",
  "/user/:userName/events/:eventId",
];
legacyCancelRoutes.forEach((path) => {
  router.delete(path, ...sameUser, eventController.cancelEventJoinForUser);
});

router.get("/user/:userName/events", ...sameUser, eventController.listUserEvents);
router.get("/user/:userName/joinedEvents", ...sameUser, eventController.listJoinedEvents);

module.exports = router;
