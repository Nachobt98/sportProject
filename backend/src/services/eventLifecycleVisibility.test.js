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

function objectId(value) {
  return { toString: () => value };
}

function queryResult(value) {
  return { exec: jest.fn().mockResolvedValue(value) };
}

function populatedQuery(value) {
  const query = queryResult(value);
  query.populate = jest.fn().mockReturnValue(query);
  return query;
}

function createEvent(overrides = {}) {
  return {
    _id: objectId("event-id"),
    creator: objectId("creator-id"),
    participants: 4,
    participantsList: [],
    dismissedBy: [],
    status: service.EVENT_STATUS.OPEN,
    date: "2026-12-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("event lifecycle visibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    Event.findById = jest.fn();
  });

  test("allows public visibility for open and full events", () => {
    const user = { _id: objectId("viewer-id") };

    expect(service.canViewEvent(createEvent(), user)).toBe(true);
    expect(service.canViewEvent(createEvent({ participants: 1, participantsList: [objectId("joined-id")] }), user)).toBe(true);
  });

  test("restricts archived events to linked users that have not dismissed them", () => {
    const creator = { _id: objectId("creator-id") };
    const participant = { _id: objectId("participant-id") };
    const stranger = { _id: objectId("stranger-id") };
    const cancelledEvent = createEvent({
      status: service.EVENT_STATUS.CANCELLED,
      participantsList: [participant._id],
    });

    expect(service.canViewEvent(cancelledEvent, creator)).toBe(true);
    expect(service.canViewEvent(cancelledEvent, participant)).toBe(true);
    expect(service.canViewEvent(cancelledEvent, stranger)).toBe(false);
    expect(service.canViewEvent(cancelledEvent, null)).toBe(false);
    expect(service.canViewEvent({ ...cancelledEvent, dismissedBy: [creator._id] }, creator)).toBe(false);
  });

  test("restricts past event detail lookup for non linked users", async () => {
    Event.findById.mockReturnValue(populatedQuery(createEvent({ date: "2020-01-01T00:00:00.000Z" })));
    User.findOne.mockReturnValue(queryResult({ _id: objectId("stranger-id"), userName: "stranger" }));

    const result = await service.findEventById("event-id", "stranger");

    expect(result.status).toBe(404);
    expect(result.body.error.code).toBe(ERROR_CODES.EVENT_NOT_FOUND);
  });

  test("allows past event detail lookup for linked users", async () => {
    Event.findById.mockReturnValue(populatedQuery(createEvent({
      date: "2020-01-01T00:00:00.000Z",
      participantsList: [{ _id: objectId("viewer-id"), userName: "viewer" }],
      creator: { _id: objectId("creator-id"), userName: "creator" },
    })));
    User.findOne.mockReturnValue(queryResult({ _id: objectId("viewer-id"), userName: "viewer" }));

    const result = await service.findEventById("event-id", "viewer");

    expect(result.status).toBe(200);
    expect(result.body.event.status).toBe(service.EVENT_STATUS.PAST);
  });
});
