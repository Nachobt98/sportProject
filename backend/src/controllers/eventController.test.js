jest.mock("../services/eventService", () => ({
  createEvent: jest.fn(),
  listEvents: jest.fn(),
  listCreatedEvents: jest.fn(),
  listJoinedEvents: jest.fn(),
  joinUserToEvent: jest.fn(),
  cancelUserEvent: jest.fn(),
  deleteEvent: jest.fn(),
}));

jest.mock("../models/User", () => ({
  findOne: jest.fn(),
}));

jest.mock("../utils/logger", () => ({
  logger: {
    error: jest.fn(),
  },
}));

const eventService = require("../services/eventService");
const User = require("../models/User");
const controller = require("./eventController");

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe("eventController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates events through the service", async () => {
    const req = { body: { name: "Padel" }, auth: { userName: "nacho" } };
    const res = createResponse();
    eventService.createEvent.mockResolvedValue({ status: 201, body: { event: req.body } });

    await controller.createEvent(req, res);

    expect(eventService.createEvent).toHaveBeenCalledWith(req.body, "nacho");
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("handles create event service errors", async () => {
    const req = { body: {}, auth: { userName: "nacho" } };
    const res = createResponse();
    eventService.createEvent.mockRejectedValue(new Error("boom"));

    await controller.createEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("lists events", async () => {
    const res = createResponse();
    eventService.listEvents.mockResolvedValue([{ _id: "1" }]);

    await controller.listEvents({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ _id: "1" }]);
  });

  test("handles list event errors", async () => {
    const res = createResponse();
    eventService.listEvents.mockRejectedValue(new Error("boom"));

    await controller.listEvents({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("returns 404 when listing events for a missing user", async () => {
    const req = { params: { userName: "nacho" } };
    const res = createResponse();
    User.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    await controller.listUserEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("lists events created by a user", async () => {
    const req = { params: { userName: "nacho" } };
    const res = createResponse();
    User.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ userName: "nacho" }) });
    eventService.listCreatedEvents.mockResolvedValue([{ _id: "1" }]);

    await controller.listUserEvents(req, res);

    expect(eventService.listCreatedEvents).toHaveBeenCalledWith("nacho");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("handles user event listing errors", async () => {
    const req = { params: { userName: "nacho" } };
    const res = createResponse();
    User.findOne.mockReturnValue({ exec: jest.fn().mockRejectedValue(new Error("boom")) });

    await controller.listUserEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("joins and cancels event participation with authenticated user", async () => {
    const req = { params: { eventId: "event-id" }, auth: { userName: "nacho" } };
    const res = createResponse();
    eventService.joinUserToEvent.mockResolvedValue({ status: 200, body: { ok: true } });
    eventService.cancelUserEvent.mockResolvedValue({ status: 200, body: { ok: true } });

    await controller.joinEvent(req, res);
    expect(eventService.joinUserToEvent).toHaveBeenCalledWith("event-id", "nacho");

    await controller.cancelEventJoin(req, res);
    expect(eventService.cancelUserEvent).toHaveBeenCalledWith("event-id", "nacho");
  });

  test("uses param user for legacy join and cancel routes", async () => {
    const req = { params: { eventId: "event-id", userName: "legacy" }, auth: { userName: "nacho" } };
    const res = createResponse();
    eventService.joinUserToEvent.mockResolvedValue({ status: 200, body: { ok: true } });
    eventService.cancelUserEvent.mockResolvedValue({ status: 200, body: { ok: true } });

    await controller.joinEventForUser(req, res);
    await controller.cancelEventJoinForUser(req, res);

    expect(eventService.joinUserToEvent).toHaveBeenCalledWith("event-id", "legacy");
    expect(eventService.cancelUserEvent).toHaveBeenCalledWith("event-id", "legacy");
  });

  test("lists joined events and handles service errors", async () => {
    const req = { params: { userName: "nacho" } };
    const res = createResponse();
    eventService.listJoinedEvents.mockResolvedValue({ status: 200, body: [] });

    await controller.listJoinedEvents(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    eventService.listJoinedEvents.mockRejectedValue(new Error("boom"));
    await controller.listJoinedEvents(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("deletes events through the service", async () => {
    const req = { params: { eventId: "event-id" }, auth: { userName: "nacho" } };
    const res = createResponse();
    eventService.deleteEvent.mockResolvedValue({ status: 200, body: { eventId: "event-id" } });

    await controller.deleteEvent(req, res);

    expect(eventService.deleteEvent).toHaveBeenCalledWith("event-id", "nacho");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
