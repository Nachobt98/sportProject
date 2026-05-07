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

describe("eventService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Event.find = jest.fn();
    Event.findById = jest.fn();
    Event.findByIdAndDelete = jest.fn();
    Event.countDocuments = jest.fn();
    Event.mockImplementation((payload) => ({ ...payload, save: jest.fn().mockResolvedValue(undefined) }));
  });

  test("finds events by id and serializes populated users", async () => {
    const event = createEventDoc({
      creator: { userName: "creator" },
      participantsList: [{ userName: "nacho" }],
    });
    Event.findById.mockReturnValue(populatedQuery(event));

    const result = await service.findEventById("event-id");

    expect(result.status).toBe(200);
    expect(result.body.event).toEqual(expect.objectContaining({
      creator: "creator",
      participantsList: ["nacho"],
    }));
  });

  test("rejects invalid or missing event detail lookups", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    await expect(service.findEventById("bad-id")).resolves.toEqual(
      expect.objectContaining({ status: 400 })
    );

    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Event.findById.mockReturnValue(populatedQuery(null));
    await expect(service.findEventById("event-id")).resolves.toEqual(
      expect.objectContaining({ status: 404 })
    );
  });

  test("builds valid event payloads with creator ObjectId", () => {
    const result = service.buildEventPayload({
      name: " Padel ",
      description: " Match ",
      sport: " Padel ",
      date: "2026-01-01",
      locationName: " Court ",
      location: " Valencia ",
      city: " Valencia ",
      participants: "4",
    }, objectId("creator-id"));

    expect(result.value).toEqual(expect.objectContaining({
      name: "Padel",
      participants: 4,
      creator: objectId("creator-id"),
      participantsList: [],
    }));
  });

  test("builds event pagination", () => {
    expect(service.buildEventPagination({ page: "2", limit: "5" })).toEqual({ page: 2, limit: 5, skip: 5 });
    expect(service.buildEventPagination({ page: "bad", limit: "1000" })).toEqual({ page: 1, limit: 50, skip: 0 });
  });

  test("builds event list filters", () => {
    const filters = service.buildEventFilters({
      city: " Valencia ",
      sport: " Padel ",
      date: "2026-01-01",
    });

    expect(filters).toEqual(expect.objectContaining({
      city: "Valencia",
      sport: "Padel",
      date: expect.objectContaining({
        $gte: expect.any(Date),
        $lt: expect.any(Date),
      }),
    }));
  });

  test("ignores empty or invalid event list filters", () => {
    expect(service.buildEventFilters({ city: "", sport: "", date: "bad-date" })).toEqual({});
  });

  test("rejects invalid event payloads", () => {
    expect(service.buildEventPayload({}, objectId("creator-id")).error).toMatch("Faltan campos obligatorios");
    expect(service.buildEventPayload({
      name: "A",
      description: "B",
      sport: "C",
      date: "bad-date",
      locationName: "D",
      location: "E",
      city: "F",
      participants: 1,
    }, objectId("creator-id")).error).toBe("La fecha del evento no es valida");
    expect(service.buildEventPayload({
      name: "A",
      description: "B",
      sport: "C",
      date: "2026-01-01",
      locationName: "D",
      location: "E",
      city: "F",
      participants: 0,
    }, objectId("creator-id")).error).toBe("El numero de participantes debe ser mayor que cero");
  });

  test("rejects event creation when payload or creator are invalid", async () => {
    User.findOne.mockReturnValue(queryResult(createUserDoc()));
    await expect(service.createEvent({}, "nacho")).resolves.toEqual(
      expect.objectContaining({ status: 400 })
    );

    User.findOne.mockReturnValue(queryResult(null));
    await expect(service.createEvent({
      name: "Padel",
      description: "Match",
      sport: "Padel",
      date: "2026-01-01",
      locationName: "Court",
      location: "Valencia",
      city: "Valencia",
      participants: 4,
    }, "missing")).resolves.toEqual(expect.objectContaining({ status: 404 }));
  });

  test("creates events", async () => {
    const user = createUserDoc();
    User.findOne.mockReturnValue(queryResult(user));

    const result = await service.createEvent({
      name: "Padel",
      description: "Match",
      sport: "Padel",
      date: "2026-01-01",
      locationName: "Court",
      location: "Valencia",
      city: "Valencia",
      participants: 4,
    }, "nacho");

    expect(result.status).toBe(201);
    expect(Event).toHaveBeenCalledWith(expect.objectContaining({ creator: user._id }));
  });

  test("lists events with pagination metadata", async () => {
    Event.find.mockReturnValue(listQuery([{ _id: "1", creator: { userName: "nacho" }, participantsList: [] }]));
    Event.countDocuments.mockReturnValue(queryResult(12));

    const result = await service.listEvents({ page: "2", limit: "10" });

    expect(result.status).toBe(200);
    expect(result.body.events).toHaveLength(1);
    expect(result.body.pagination).toEqual(expect.objectContaining({
      page: 2,
      limit: 10,
      total: 12,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    }));
    expect(Event.find).toHaveBeenCalledWith({});
  });

  test("lists filtered events", async () => {
    Event.find.mockReturnValue(listQuery([{ _id: "1", creator: { userName: "nacho" }, participantsList: [] }]));
    Event.countDocuments.mockReturnValue(queryResult(1));

    const result = await service.listEvents({ city: "Valencia", sport: "Padel" });

    expect(result.status).toBe(200);
    expect(Event.find).toHaveBeenCalledWith({ city: "Valencia", sport: "Padel" });
  });

  test("lists created events by creator ObjectId", async () => {
    const user = createUserDoc();
    User.findOne.mockReturnValue(queryResult(user));
    Event.find.mockReturnValue(listQuery([{ creator: { userName: "nacho" }, participantsList: [] }]));

    await expect(service.listCreatedEvents("nacho")).resolves.toEqual([
      expect.objectContaining({ creator: "nacho" }),
    ]);
    expect(Event.find).toHaveBeenCalledWith({ creator: user._id });
  });

  test("returns an empty list when created events user is missing", async () => {
    User.findOne.mockReturnValue(queryResult(null));

    await expect(service.listCreatedEvents("missing")).resolves.toEqual([]);
  });

  test("lists joined events", async () => {
    User.findOne.mockReturnValue(queryResult({ joinedEvents: ["1"] }));
    Event.find.mockReturnValue(listQuery([{ _id: "1", creator: { userName: "other" }, participantsList: [{ userName: "nacho" }] }]));

    const result = await service.listJoinedEvents("nacho");

    expect(result.status).toBe(200);
    expect(result.body).toEqual([expect.objectContaining({ participantsList: ["nacho"] })]);
  });

  test("returns 404 when listing joined events for a missing user", async () => {
    User.findOne.mockReturnValue(queryResult(null));

    const result = await service.listJoinedEvents("missing");

    expect(result.status).toBe(404);
  });

  test("joins users to events", async () => {
    const event = createEventDoc({ participantsList: [] });
    const user = createUserDoc();
    Event.findById.mockReturnValueOnce(queryResult(event)).mockReturnValueOnce(populatedQuery({ ...event, creator: { userName: "creator" }, participantsList: [{ userName: "nacho" }] }));
    User.findOne.mockReturnValue(queryResult(user));

    const result = await service.joinUserToEvent("event-id", "nacho");

    expect(result.status).toBe(200);
    expect(event.participantsList).toContain(user._id);
    expect(user.joinedEvents.addToSet).toHaveBeenCalledWith(event._id);
  });

  test("rejects duplicated joins", async () => {
    Event.findById.mockReturnValue(queryResult(createEventDoc({ participantsList: [objectId("user-id")] })));
    User.findOne.mockReturnValue(queryResult(createUserDoc()));

    const result = await service.joinUserToEvent("event-id", "nacho");

    expect(result.status).toBe(409);
  });

  test("rejects joins for invalid users, missing events, creators and full events", async () => {
    await expect(service.joinUserToEvent("event-id", "")).resolves.toEqual(
      expect.objectContaining({ status: 400 })
    );

    Event.findById.mockReturnValue(queryResult(null));
    User.findOne.mockReturnValue(queryResult(createUserDoc()));
    await expect(service.joinUserToEvent("event-id", "nacho")).resolves.toEqual(
      expect.objectContaining({ status: 404 })
    );

    Event.findById.mockReturnValue(queryResult(createEventDoc()));
    User.findOne.mockReturnValue(queryResult(null));
    await expect(service.joinUserToEvent("event-id", "nacho")).resolves.toEqual(
      expect.objectContaining({ status: 404 })
    );

    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: objectId("user-id") })));
    User.findOne.mockReturnValue(queryResult(createUserDoc()));
    await expect(service.joinUserToEvent("event-id", "nacho")).resolves.toEqual(
      expect.objectContaining({ status: 400 })
    );

    Event.findById.mockReturnValue(queryResult(createEventDoc({ participants: 1, participantsList: [objectId("other-id")] })));
    User.findOne.mockReturnValue(queryResult(createUserDoc()));
    await expect(service.joinUserToEvent("event-id", "nacho")).resolves.toEqual(
      expect.objectContaining({ status: 409 })
    );
  });

  test("cancels user participation", async () => {
    const event = createEventDoc({ participantsList: [objectId("user-id"), objectId("other-id")] });
    const user = createUserDoc({ joinedEvents: [{ toString: () => "event-id" }, { toString: () => "other-id" }] });
    Event.findById.mockReturnValueOnce(queryResult(event)).mockReturnValueOnce(populatedQuery({ ...event, creator: { userName: "creator" }, participantsList: [] }));
    User.findOne.mockReturnValue(queryResult(user));

    const result = await service.cancelUserEvent("event-id", "nacho");

    expect(result.status).toBe(200);
    expect(event.participantsList).toHaveLength(1);
    expect(user.joinedEvents).toHaveLength(1);
  });

  test("returns lookup errors when cancelling participation", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);

    await expect(service.cancelUserEvent("bad", "nacho")).resolves.toEqual(
      expect.objectContaining({ status: 400 })
    );
  });

  test("deletes owned events", async () => {
    const user = createUserDoc();
    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: user._id })));
    User.findOne.mockReturnValue(queryResult(user));
    Event.findByIdAndDelete.mockReturnValue(queryResult({}));
    User.updateMany.mockReturnValue(queryResult({}));

    const result = await service.deleteEvent("event-id", "nacho");

    expect(result.status).toBe(200);
    expect(Event.findByIdAndDelete).toHaveBeenCalledWith("event-id");
  });

  test("rejects deleting missing or foreign events", async () => {
    Event.findById.mockReturnValue(queryResult(null));
    User.findOne.mockReturnValue(queryResult(createUserDoc()));
    await expect(service.deleteEvent("event-id", "nacho")).resolves.toEqual(
      expect.objectContaining({ status: 404 })
    );

    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: objectId("other-id") })));
    User.findOne.mockReturnValue(queryResult(createUserDoc()));
    await expect(service.deleteEvent("event-id", "nacho")).resolves.toEqual(
      expect.objectContaining({ status: 403 })
    );
  });

  test("rejects invalid event identifiers", async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    await expect(service.joinUserToEvent("bad", "nacho")).resolves.toEqual(
      expect.objectContaining({ status: 400 })
    );
    await expect(service.deleteEvent("bad", "nacho")).resolves.toEqual(
      expect.objectContaining({ status: 400 })
    );
  });
});
