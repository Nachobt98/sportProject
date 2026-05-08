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
  return {
    _id: objectId("event-id"),
    creator: objectId("creator-id"),
    participants: 3,
    participantsList: [],
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

const validPayload = {
  name: " Padel ",
  description: " Match ",
  sport: " Padel ",
  date: "2026-01-01",
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

  test("builds event filters and pagination", () => {
    expect(service.buildEventFilters({ city: " Valencia ", sport: " Padel ", date: "2026-01-01" })).toEqual(
      expect.objectContaining({
        city: "Valencia",
        sport: "Padel",
        date: expect.objectContaining({ $gte: expect.any(Date), $lt: expect.any(Date) }),
      })
    );
    expect(service.buildEventFilters({ city: "", sport: "", date: "bad-date" })).toEqual({});
    expect(service.buildEventPagination({ page: "2", limit: "5" })).toEqual({ page: 2, limit: 5, skip: 5 });
    expect(service.buildEventPagination({ page: "bad", limit: "1000" })).toEqual({ page: 1, limit: 50, skip: 0 });
  });

  test("builds editable event payloads", () => {
    const result = service.buildEditableEventPayload(validPayload);

    expect(result.value).toEqual(expect.objectContaining({
      name: "Padel",
      description: "Match",
      participants: 4,
      date: expect.any(Date),
    }));
  });

  test("builds valid event payloads with creator ObjectId", () => {
    const creatorId = objectId("creator-id");
    const result = service.buildEventPayload(validPayload, creatorId);

    expect(result.value).toEqual(
      expect.objectContaining({
        name: "Padel",
        participants: 4,
        creator: creatorId,
        participantsList: [],
      })
    );
  });

  test("rejects invalid event payloads", () => {
    expect(service.buildEventPayload({}, objectId("creator-id")).error).toMatch("Faltan campos obligatorios");
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
    expect(result.body.event).toEqual(expect.objectContaining({ creator: "creator", participantsList: ["nacho"] }));
  });

  test("rejects invalid or missing event detail lookups", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    await expect(service.findEventById("bad-id")).resolves.toEqual(expect.objectContaining({ status: 400 }));

    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Event.findById.mockReturnValue(populatedQuery(null));
    await expect(service.findEventById("event-id")).resolves.toEqual(expect.objectContaining({ status: 404 }));
  });

  test("creates events with creator ObjectId", async () => {
    const user = createUserDoc();
    User.findOne.mockReturnValue(queryResult(user));

    const result = await service.createEvent(validPayload, "nacho");

    expect(result.status).toBe(201);
    expect(Event).toHaveBeenCalledWith(expect.objectContaining({ creator: user._id }));
  });

  test("rejects event creation when creator is missing", async () => {
    User.findOne.mockReturnValue(queryResult(null));

    await expect(service.createEvent(validPayload, "missing")).resolves.toEqual(expect.objectContaining({ status: 404 }));
  });

  test("lists filtered events with pagination metadata", async () => {
    Event.find.mockReturnValue(listQuery([{ _id: "1", creator: { userName: "nacho" }, participantsList: [] }]));
    Event.countDocuments.mockReturnValue(queryResult(12));

    const result = await service.listEvents({ city: "Valencia", sport: "Padel", page: "2", limit: "10" });

    expect(Event.find).toHaveBeenCalledWith({ city: "Valencia", sport: "Padel" });
    expect(result.status).toBe(200);
    expect(result.body.events).toEqual([expect.objectContaining({ creator: "nacho" })]);
    expect(result.body.pagination).toEqual(expect.objectContaining({ page: 2, limit: 10, total: 12, totalPages: 2 }));
  });

  test("lists created and joined events", async () => {
    const user = createUserDoc({ joinedEvents: ["event-id"] });
    User.findOne.mockReturnValue(queryResult(user));
    Event.find.mockReturnValue(listQuery([{ creator: { userName: "nacho" }, participantsList: [{ userName: "other" }] }]));

    await expect(service.listCreatedEvents("nacho")).resolves.toEqual([expect.objectContaining({ creator: "nacho" })]);
    expect(Event.find).toHaveBeenCalledWith({ creator: user._id });

    const joinedResult = await service.listJoinedEvents("nacho");
    expect(joinedResult.status).toBe(200);
    expect(joinedResult.body).toEqual([expect.objectContaining({ participantsList: ["other"] })]);
  });

  test("handles missing users in event list lookups", async () => {
    User.findOne.mockReturnValue(queryResult(null));

    await expect(service.listCreatedEvents("missing")).resolves.toEqual([]);
    await expect(service.listJoinedEvents("missing")).resolves.toEqual(expect.objectContaining({ status: 404 }));
  });

  test("joins users to events", async () => {
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
    await expect(service.joinUserToEvent("event-id", "")).resolves.toEqual(expect.objectContaining({ status: 400 }));

    Event.findById.mockReturnValue(queryResult(createEventDoc({ participantsList: [objectId("user-id")] })));
    User.findOne.mockReturnValue(queryResult(createUserDoc()));
    await expect(service.joinUserToEvent("event-id", "nacho")).resolves.toEqual(expect.objectContaining({ status: 409 }));

    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: objectId("user-id") })));
    await expect(service.joinUserToEvent("event-id", "nacho")).resolves.toEqual(expect.objectContaining({ status: 400 }));
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

  test("updates owned events", async () => {
    const event = createEventDoc({ creator: objectId("user-id"), participantsList: [objectId("player-id")] });
    const user = createUserDoc();
    Event.findById
      .mockReturnValueOnce(queryResult(event))
      .mockReturnValueOnce(populatedQuery({ ...event, ...validPayload, creator: { userName: "nacho" }, participantsList: [{ userName: "player" }] }));
    User.findOne.mockReturnValue(queryResult(user));

    const result = await service.updateEvent("event-id", { ...validPayload, name: "Updated match", participants: 2 }, "nacho");

    expect(result.status).toBe(200);
    expect(event.name).toBe("Updated match");
    expect(event.save).toHaveBeenCalled();
    expect(result.body.event).toEqual(expect.objectContaining({ creator: "nacho", participantsList: ["player"] }));
  });

  test("rejects invalid event updates", async () => {
    const user = createUserDoc();
    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: objectId("other-id") })));
    User.findOne.mockReturnValue(queryResult(user));
    await expect(service.updateEvent("event-id", validPayload, "nacho")).resolves.toEqual(expect.objectContaining({ status: 403 }));

    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: user._id, participantsList: [objectId("one"), objectId("two")] })));
    await expect(service.updateEvent("event-id", { ...validPayload, participants: 1 }, "nacho")).resolves.toEqual(expect.objectContaining({ status: 400 }));

    await expect(service.updateEvent("event-id", { ...validPayload, date: "bad-date" }, "nacho")).resolves.toEqual(expect.objectContaining({ status: 400 }));
  });

  test("deletes owned events and rejects foreign deletes", async () => {
    const user = createUserDoc();
    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: user._id })));
    User.findOne.mockReturnValue(queryResult(user));
    Event.findByIdAndDelete.mockReturnValue(queryResult({}));
    User.updateMany.mockReturnValue(queryResult({}));

    await expect(service.deleteEvent("event-id", "nacho")).resolves.toEqual(expect.objectContaining({ status: 200 }));

    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: objectId("other-id") })));
    await expect(service.deleteEvent("event-id", "nacho")).resolves.toEqual(expect.objectContaining({ status: 403 }));
  });

  test("rejects invalid event identifiers", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);

    await expect(service.joinUserToEvent("bad", "nacho")).resolves.toEqual(expect.objectContaining({ status: 400 }));
    await expect(service.cancelUserEvent("bad", "nacho")).resolves.toEqual(expect.objectContaining({ status: 400 }));
    await expect(service.updateEvent("bad", validPayload, "nacho")).resolves.toEqual(expect.objectContaining({ status: 400 }));
    await expect(service.deleteEvent("bad", "nacho")).resolves.toEqual(expect.objectContaining({ status: 400 }));
  });
});
