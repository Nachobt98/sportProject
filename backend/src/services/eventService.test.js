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

function sortedQuery(value) {
  return { sort: jest.fn().mockReturnValue(queryResult(value)) };
}

function createEventDoc(overrides = {}) {
  return {
    _id: "event-id",
    creator: "creator",
    participants: 3,
    participantsList: [],
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createUserDoc(overrides = {}) {
  return {
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
    Event.mockImplementation((payload) => ({ ...payload, save: jest.fn().mockResolvedValue(undefined) }));
  });

  test("builds valid event payloads", () => {
    const result = service.buildEventPayload({
      name: " Padel ",
      description: " Match ",
      sport: " Padel ",
      date: "2026-01-01",
      locationName: " Court ",
      location: " Valencia ",
      city: " Valencia ",
      participants: "4",
      creator: " nacho ",
    });

    expect(result.value).toEqual(expect.objectContaining({
      name: "Padel",
      participants: 4,
      creator: "nacho",
      participantsList: [],
    }));
  });

  test("rejects invalid event payloads", () => {
    expect(service.buildEventPayload({}).error).toMatch("Faltan campos obligatorios");
    expect(service.buildEventPayload({
      name: "A",
      description: "B",
      sport: "C",
      date: "bad-date",
      locationName: "D",
      location: "E",
      city: "F",
      creator: "G",
      participants: 1,
    }).error).toBe("La fecha del evento no es valida");
  });

  test("creates events", async () => {
    User.findOne.mockReturnValue(queryResult({ userName: "nacho" }));

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
    expect(Event).toHaveBeenCalled();
  });

  test("lists events", async () => {
    Event.find.mockReturnValue(sortedQuery([{ _id: "1" }]));
    await expect(service.listEvents()).resolves.toEqual([{ _id: "1" }]);
  });

  test("lists created events", async () => {
    Event.find.mockReturnValue(sortedQuery([{ creator: "nacho" }]));
    await expect(service.listCreatedEvents("nacho")).resolves.toEqual([{ creator: "nacho" }]);
  });

  test("lists joined events", async () => {
    User.findOne.mockReturnValue(queryResult({ joinedEvents: ["1"] }));
    Event.find.mockReturnValue(sortedQuery([{ _id: "1" }]));

    const result = await service.listJoinedEvents("nacho");

    expect(result.status).toBe(200);
    expect(result.body).toEqual([{ _id: "1" }]);
  });

  test("joins users to events", async () => {
    const event = createEventDoc({ participantsList: [] });
    const user = createUserDoc();
    Event.findById.mockReturnValue(queryResult(event));
    User.findOne.mockReturnValue(queryResult(user));

    const result = await service.joinUserToEvent("event-id", "nacho");

    expect(result.status).toBe(200);
    expect(event.participantsList).toContain("nacho");
    expect(user.joinedEvents.addToSet).toHaveBeenCalledWith("event-id");
  });

  test("rejects duplicated joins", async () => {
    Event.findById.mockReturnValue(queryResult(createEventDoc({ participantsList: ["nacho"] })));
    User.findOne.mockReturnValue(queryResult(createUserDoc()));

    const result = await service.joinUserToEvent("event-id", "nacho");

    expect(result.status).toBe(409);
  });

  test("cancels user participation", async () => {
    const event = createEventDoc({ participantsList: ["nacho", "other"] });
    const user = createUserDoc({ joinedEvents: [{ toString: () => "event-id" }, { toString: () => "other-id" }] });
    Event.findById.mockReturnValue(queryResult(event));
    User.findOne.mockReturnValue(queryResult(user));

    const result = await service.cancelUserEvent("event-id", "nacho");

    expect(result.status).toBe(200);
    expect(event.participantsList).toEqual(["other"]);
    expect(user.joinedEvents).toHaveLength(1);
  });

  test("deletes owned events", async () => {
    Event.findById.mockReturnValue(queryResult(createEventDoc({ creator: "nacho" })));
    Event.findByIdAndDelete.mockReturnValue(queryResult({}));
    User.updateMany.mockReturnValue(queryResult({}));

    const result = await service.deleteEvent("event-id", "nacho");

    expect(result.status).toBe(200);
    expect(Event.findByIdAndDelete).toHaveBeenCalledWith("event-id");
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
