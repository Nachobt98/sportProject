jest.mock("../services/eventService", () => ({
  createEvent: jest.fn(),
  findEventById: jest.fn(),
  listEvents: jest.fn(),
  listCreatedEvents: jest.fn(),
  listJoinedEvents: jest.fn(),
  joinUserToEvent: jest.fn(),
  cancelUserEvent: jest.fn(),
  updateEvent: jest.fn(),
  cancelEvent: jest.fn(),
  dismissEventForUser: jest.fn(),
  deleteEvent: jest.fn(),
}));

jest.mock("../utils/logger", () => ({
  logger: {
    error: jest.fn(),
  },
}));

const eventService = require("../services/eventService");
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

  test("lists paginated events for the authenticated user", async () => {
    const req = { query: { city: "Valencia", page: "2" }, auth: { userName: "nacho" } };
    const res = createResponse();
    const body = { events: [{ _id: "1" }], pagination: { page: 2 } };
    eventService.listEvents.mockResolvedValue({ status: 200, body });

    await controller.listEvents(req, res);

    expect(eventService.listEvents).toHaveBeenCalledWith(req.query, "nacho");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(body);
  });

  test("gets event details by id", async () => {
    const req = { params: { eventId: "event-id" } };
    const res = createResponse();
    eventService.findEventById.mockResolvedValue({ status: 200, body: { event: { _id: "event-id" } } });

    await controller.getEventById(req, res);

    expect(eventService.findEventById).toHaveBeenCalledWith("event-id");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("handles list event errors", async () => {
    const res = createResponse();
    eventService.listEvents.mockRejectedValue(new Error("boom"));

    await controller.listEvents({ query: {}, auth: { userName: "nacho" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("lists current user events from auth token", async () => {
    const req = { auth: { userName: "nacho" } };
    const res = createResponse();
    eventService.listCreatedEvents.mockResolvedValue([{ _id: "created" }]);

    await controller.listCurrentUserEvents(req, res);

    expect(eventService.listCreatedEvents).toHaveBeenCalledWith("nacho");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ _id: "created" }]);
  });

  test("handles current user event listing errors", async () => {
    const req = { auth: { userName: "nacho" } };
    const res = createResponse();
    eventService.listCreatedEvents.mockRejectedValue(new Error("boom"));

    await controller.listCurrentUserEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("lists current user joined events from auth token", async () => {
    const req = { auth: { userName: "nacho" } };
    const res = createResponse();
    eventService.listJoinedEvents.mockResolvedValue({ status: 200, body: [{ _id: "joined" }] });

    await controller.listCurrentUserJoinedEvents(req, res);

    expect(eventService.listJoinedEvents).toHaveBeenCalledWith("nacho");
    expect(res.status).toHaveBeenCalledWith(200);
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

  test("updates, cancels and dismisses events through the service", async () => {
    const req = { body: { name: "Padel updated" }, params: { eventId: "event-id" }, auth: { userName: "nacho" } };
    const res = createResponse();
    eventService.updateEvent.mockResolvedValue({ status: 200, body: { event: req.body } });
    eventService.cancelEvent.mockResolvedValue({ status: 200, body: { event: { status: "cancelled" } } });
    eventService.dismissEventForUser.mockResolvedValue({ status: 200, body: { eventId: "event-id" } });

    await controller.updateEvent(req, res);
    expect(eventService.updateEvent).toHaveBeenCalledWith("event-id", req.body, "nacho");

    await controller.cancelEvent(req, res);
    expect(eventService.cancelEvent).toHaveBeenCalledWith("event-id", "nacho");

    await controller.dismissEvent(req, res);
    expect(eventService.dismissEventForUser).toHaveBeenCalledWith("event-id", "nacho");
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
