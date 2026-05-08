jest.mock("mongoose", () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn(),
    },
  },
}));

jest.mock("../models/Event", () => jest.fn());
jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  updateMany: jest.fn(),
}));

const mongoose = require("mongoose");
const Event = require("../models/Event");
const User = require("../models/User");
const { ERROR_CODES } = require("../utils/apiResponses");
const service = require("./eventService");

function queryResult(value) {
  return { exec: jest.fn().mockResolvedValue(value) };
}

function populatedQuery(value) {
  const query = queryResult(value);
  query.populate = jest.fn().mockReturnValue(query);
  return query;
}

function listQuery(value) {
  const query = queryResult(value);
  query.sort = jest.fn().mockReturnValue(query);
  query.skip = jest.fn().mockReturnValue(query);
  query.limit = jest.fn().mockReturnValue(query);
  query.populate = jest.fn().mockReturnValue(query);
  return query;
}

function objectId(value) {
  return { toString: () => value };
}

function createUserDoc(overrides = {}) {
  return {
    _id: objectId("user-id"),
    userName: "nacho",
    joinedEvents: {
      addToSet: jest.fn(),
      filter: Array.prototype.filter,
    },
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createEventDoc(overrides = {}) {
  const dismissedBy = [];
  dismissedBy.addToSet = jest.fn((value) => dismissedBy.push(value));

  return {
    _id: objectId("event-id"),
    creator: objectId("creator-id"),
    participants: 3,
    participantsList: [],
    dismissedBy,
    status: service.EVENT_STATUS.OPEN,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

const validPayload = {
  name: " Padel ",
  description: " Match ",
  sport: " Padel ",
  date: "2026-12-01",
  locationName: " Court ",
  location: " Valencia ",
  city: " Valencia ",
  participants: "4",
};

describe("eventService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Event.find = jest.fn();
    Event.findById = jest.fn();
    Event.findByIdAndDelete = jest.fn();
    Event.countDocuments = jest.fn();
    Event.mockImplementation((payload) => ({
      ...payload,
      save: jest.fn().mockResolvedValue(undefined),
    }));
  });

  test("builds event filters, public filters and pagination", () => {
    expect(service.buildEventFilters({ city: " Valencia ", sport: " Padel ", date: "2026-01-01" })).toEqual(
      expect.objectContaining({
        city: "Valencia",
        sport: "Padel",
        date: expect.objectContaining({ $gte: expect.any(Date), $lt: expect.any(Date) }),
      })
    );
    expect(service.buildEventFilters({ city: "", sport: "", date: "bad-date" })).toEqual({});
    expect(service.buildPublicEventQuery({ city: "Valencia" }, { _id: objectId("user-id") })).toEqual(
      expect.objectContaining({
        city: "Valencia",
        status: service.EVENT_STATUS.OPEN,
        date: expect.objectContaining({ $gte: expect.any(Date) }),
        dismissedBy: { $ne: expect.any(Object) },
      })
    );
    expect(service.buildEventPagination({ page: "2", limit: "5" })).toEqual({ page: 2, limit: 5, skip: 5 });
    expect(service.buildEventPagination({ page: "bad", limit: "1000" })).toEqual({ page: 1, limit: 50, skip: 0 });
  });

  test("builds editable and creation event payloads", () => {
    const editable = service.buildEditableEventPayload(validPayload);
    expect(editable.value).toEqual(expect.objectContaining({
      name: "Padel",
      description: "Match",
      participants: 4,
      date: expect.any(Date),
    }));

    const creatorId = objectId("creator-id");
    const creation = service.buildEventPayload(validPayload, creatorId);
    expect(creation.value).toEqual(expect.objectContaining({
      creator: creatorId,
      participantsList: [],
      dismissedBy: [],
      status: service.EVENT_STATUS.OPEN,
    }));
  });

  test("rejects invalid event payloads", () => {
    const missingFields = service.buildEventPayload({}, objectId("creator-id"));
    expect(missingFields.error).toMatch("Faltan campos obligatorios");
    expect(missingFields.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(service.buildEventPayload({ ...validPayload, date: "bad-date" }, objectId("creator-id")).error).toBe("La fecha del evento no es valida");
    expect(service.buildEventPayload({ ...validPayload, participants: 0 }, objectId("creator-id")).error).toBe("El numero de participantes debe ser mayor que cero");
  });

  test("finds events by id", async () => {
    Event.findById.mockReturnValue(populatedQuery(createEventDoc({
      creator: { userName: "creator" },
      participantsList: [{ userName: "nacho" }],
    })));

    const result = await service.findEventById("event-id");

    expect(result.status).toBe(200);
    expect(result.body.event).toEqual(expect.objectContaining({ creator: "creator", participantsList: ["nacho"], status: "open" }));
  });

  test("rejects invalid or missing event detail lookups", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    const invalidResult = await service.findEventById("bad-id");
    expect(invalidResult.status).toBe(400);
    expect(invalidResult.body.error.code).toBe(ERROR_CODES.INVALID_EVENT_ID);

    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Event.findById.mockReturnValue(populatedQuery(null));
    const missingResult = await service.findEventById("event-id");
    expect(missingResult.status).toBe(404);
    expect(missingResult.body.error.code).toBe(ERROR_CODES.EVENT_NOT_FOUND);
  });

  test("creates events with creator ObjectId", async () => {
    const user = createUserDoc();
    User.findOne.mockReturnValue(queryResult(user));

    const result = await service.createEvent(validPayload, "nacho");

    expect(result.status).toBe(201);
    expect(Event).toHaveBeenCalledWith(expect.objectContaining({ creator: user._id, status: service.EVENT_STATUS.OPEN }));
  });

  test("rejects event creation when creator is missing", async () => {
    User.findOne.mockReturnValue(queryResult(null));

    const result = await service.createEvent(validPayload, "missing");
    expect(result.status).toBe(404);
    expect(result.body.error.code).toBe(ERROR_CODES.USER_NOT_FOUND);
  });

  test("lists public events with lifecycle visibility and pagination metadata", async () => {
    Event.find.mockReturnValue(listQuery([{ _id: "1", creator: { userName: "nacho" }, participantsList: [] }]));
    Event.countDocuments.mockReturnValue(queryResult(12));

    const result = await service.listEvents({ city: "Valencia", sport: "Padel", page: "2", limit: "10" });

    expect(Event.find).toHaveBeenCalledWith(expect.objectContaining({
      city: "Valencia",
      sport: "Padel",
      status: service.EVENT_STATUS.OPEN,
      date: expect.objectContaining({ $gte: expect.any(Date) }),
    }));
    expect(result.status).toBe(200);
    expect(result.body.events).toEqual([expect.objectContaining({ creator: "nacho" })]);
    expect(result.body.pagination).toEqual(expect.objectContaining({ page: 2, limit: 10, total: 12, totalPages: 2 }));
  });

  test("lists created and joined events excluding dismissed ones", async () => {
    const user = createUserDoc({ joinedEvents: ["event-id"] });
    User.findOne.mockReturnValue(queryResult(user));
    Event.find.mockReturnValue(listQuery([{ creator: { userName: "nacho" }, participantsList: [{ userName: "other" }] }]));

    await expect(service.listCreatedEvents("nacho")).resolves.toEqual([expect.objectContaining({ creator: "nacho" })]);
    expect(Event.find).toHaveBeenCalledWith({ creator: user._id, dismissedBy: { $ne: user._id } });

    const joinedResult = await service.listJoinedEvents("nacho");
    expect(joinedResult.status).toBe(200);
    expect(Event.find).toHaveBeenLastCalledWith({ _id: { $in: user.joinedEvents }, dismissedBy: { $ne: user._id } });
    expect(joinedResult.body).toEqual([expect.objectContaining({ participantsList: ["other"] })]);
  });

  test("handles missing users in event list lookups", async () => {
    User.findOne.mockReturnValue(queryResult(null));

    await expect(service.listCreatedEvents("missing")).resolves.toEqual([]);
    const joinedResult = await service.listJoinedEvents("missing");
    expect(joinedResult.status).toBe(404);
    expect(joinedResult.body.error.code).toBe(ERROR_CODES.USER_NOT_FOUND);
  });

  test("joins users to open events", async () => {
    const event = createEventDoc({ participantsList: [] });
    const user = createUserDoc();
    Event.findById
      .mockReturnValueOnce(queryResult(event))
      .mockReturnValueOnce(populatedQuery({ ...event, creator: { userName: "creator" }, participantsList: [{ userName: "nacho" }] }));
    User.findOne.mockReturnValue(queryResult(user));

    const result = await service.joinUserToEvent("event-id", "nacho");

    expect(result.status).toBe(200);
    expect(event.participantsList).toContain(user._id);
    expect(user.joinedEvents.addToSet).toHaveBeenCalledWith(event._id);
  });

  test("rejects invalid joins", async () => {
    const missingParams = await service.joinUserToEvent("event-id", "");
    expect(missingParams.status).toBe(400);
    expect(missingParams.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);

    Event.findById.mockReturnValue(queryResult(createEventDoc({ participantsList: [objectId("user-id")] })));
    User.findOne.mockReturnValue(queryResult(createUserDoc()));
    const duplicateResult = await service.joinUserToEvent("event-id", "nacho");
    expect(duplicateResult.status).toBe(409);
    expect(duplicateResult.body.error.code).toBe(ERROR_CODES.EVENT_ALREADY_JOINED);

    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: objectId("user-id") })));
    const creatorResult = await service.joinUserToEvent("event-id", "nacho");
    expect(creatorResult.status).toBe(400);
    expect(creatorResult.body.error.code).toBe(ERROR_CODES.EVENT_CREATOR_CANNOT_JOIN);
  });

  test("rejects joins when event is full, cancelled or past", async () => {
    User.findOne.mockReturnValue(queryResult(createUserDoc()));

    Event.findById.mockReturnValue(queryResult(createEventDoc({ participants: 1, participantsList: [objectId("other-id")] })));
    const fullResult = await service.joinUserToEvent("event-id", "nacho");
    expect(fullResult.status).toBe(409);
    expect(fullResult.body.error.code).toBe(ERROR_CODES.EVENT_FULL);

    Event.findById.mockReturnValue(queryResult(createEventDoc({ status: service.EVENT_STATUS.CANCELLED })));
    const cancelledResult = await service.joinUserToEvent("event-id", "nacho");
    expect(cancelledResult.status).toBe(409);

    Event.findById.mockReturnValue(queryResult(createEventDoc({ date: "2020-01-01" })));
    const pastResult = await service.joinUserToEvent("event-id", "nacho");
    expect(pastResult.status).toBe(409);
  });

  test("cancels user participation", async () => {
    const event = createEventDoc({ participantsList: [objectId("user-id"), objectId("other-id")] });
    const user = createUserDoc({ joinedEvents: [{ toString: () => "event-id" }, { toString: () => "other-id" }] });
    Event.findById
      .mockReturnValueOnce(queryResult(event))
      .mockReturnValueOnce(populatedQuery({ ...event, creator: { userName: "creator" }, participantsList: [] }));
    User.findOne.mockReturnValue(queryResult(user));

    const result = await service.cancelUserEvent("event-id", "nacho");

    expect(result.status).toBe(200);
    expect(event.participantsList).toHaveLength(1);
    expect(user.joinedEvents).toHaveLength(1);
  });

  test("updates owned events and reopens past events when the date changes", async () => {
    const event = createEventDoc({ creator: objectId("user-id"), participantsList: [objectId("player-id")], date: "2020-01-01" });
    const user = createUserDoc();
    Event.findById
      .mockReturnValueOnce(queryResult(event))
      .mockReturnValueOnce(populatedQuery({ ...event, ...validPayload, creator: { userName: "nacho" }, participantsList: [{ userName: "player" }] }));
    User.findOne.mockReturnValue(queryResult(user));

    const result = await service.updateEvent("event-id", { ...validPayload, name: "Updated match", participants: 2 }, "nacho");

    expect(result.status).toBe(200);
    expect(event.name).toBe("Updated match");
    expect(event.status).toBe(service.EVENT_STATUS.OPEN);
    expect(event.save).toHaveBeenCalled();
    expect(result.body.event).toEqual(expect.objectContaining({ creator: "nacho", participantsList: ["player"] }));
  });

  test("rejects invalid or cancelled event updates", async () => {
    const user = createUserDoc();
    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: objectId("other-id") })));
    User.findOne.mockReturnValue(queryResult(user));
    const forbiddenResult = await service.updateEvent("event-id", validPayload, "nacho");
    expect(forbiddenResult.status).toBe(403);
    expect(forbiddenResult.body.error.code).toBe(ERROR_CODES.EVENT_FORBIDDEN);

    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: user._id, status: service.EVENT_STATUS.CANCELLED })));
    const cancelledResult = await service.updateEvent("event-id", validPayload, "nacho");
    expect(cancelledResult.status).toBe(409);

    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: user._id, participantsList: [objectId("one"), objectId("two")] })));
    const capacityResult = await service.updateEvent("event-id", { ...validPayload, participants: 1 }, "nacho");
    expect(capacityResult.status).toBe(400);
    expect(capacityResult.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);

    const invalidDateResult = await service.updateEvent("event-id", { ...validPayload, date: "bad-date" }, "nacho");
    expect(invalidDateResult.status).toBe(400);
    expect(invalidDateResult.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  test("cancels owned events and rejects foreign cancellations", async () => {
    const user = createUserDoc();
    const event = createEventDoc({ creator: user._id });
    Event.findById
      .mockReturnValueOnce(queryResult(event))
      .mockReturnValueOnce(populatedQuery({ ...event, creator: { userName: "nacho" } }));
    User.findOne.mockReturnValue(queryResult(user));

    const result = await service.cancelEvent("event-id", "nacho");
    expect(result.status).toBe(200);
    expect(event.status).toBe(service.EVENT_STATUS.CANCELLED);

    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: objectId("other-id") })));
    const forbiddenResult = await service.cancelEvent("event-id", "nacho");
    expect(forbiddenResult.status).toBe(403);
  });

  test("dismisses cancelled, past or owned events for one user", async () => {
    const user = createUserDoc();
    const event = createEventDoc({ creator: user._id, status: service.EVENT_STATUS.CANCELLED });
    Event.findById.mockReturnValue(queryResult(event));
    User.findOne.mockReturnValue(queryResult(user));

    const result = await service.dismissEventForUser("event-id", "nacho");
    expect(result.status).toBe(200);
    expect(event.dismissedBy.addToSet).toHaveBeenCalledWith(user._id);

    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: objectId("other-id") })));
    const forbiddenResult = await service.dismissEventForUser("event-id", "nacho");
    expect(forbiddenResult.status).toBe(409);
  });

  test("deletes owned events and rejects foreign deletes", async () => {
    const user = createUserDoc();
    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: user._id })));
    User.findOne.mockReturnValue(queryResult(user));
    Event.findByIdAndDelete.mockReturnValue(queryResult({}));
    User.updateMany.mockReturnValue(queryResult({}));

    await expect(service.deleteEvent("event-id", "nacho")).resolves.toEqual(expect.objectContaining({ status: 200 }));

    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: objectId("other-id") })));
    const forbiddenResult = await service.deleteEvent("event-id", "nacho");
    expect(forbiddenResult.status).toBe(403);
    expect(forbiddenResult.body.error.code).toBe(ERROR_CODES.EVENT_FORBIDDEN);
  });

  test("rejects invalid event identifiers", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);

    const joinResult = await service.joinUserToEvent("bad", "nacho");
    expect(joinResult.status).toBe(400);
    expect(joinResult.body.error.code).toBe(ERROR_CODES.INVALID_EVENT_ID);

    const cancelJoinResult = await service.cancelUserEvent("bad", "nacho");
    expect(cancelJoinResult.status).toBe(400);

    const updateResult = await service.updateEvent("bad", validPayload, "nacho");
    expect(updateResult.status).toBe(400);

    const cancelEventResult = await service.cancelEvent("bad", "nacho");
    expect(cancelEventResult.status).toBe(400);

    const dismissResult = await service.dismissEventForUser("bad", "nacho");
    expect(dismissResult.status).toBe(400);

    const deleteResult = await service.deleteEvent("bad", "nacho");
    expect(deleteResult.status).toBe(400);
  });
});
