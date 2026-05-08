const {
  EVENT_STATUS,
  getEffectiveEventStatus,
  isPastEventDate,
  toEventDto,
  serializeUserReference,
} = require("./eventDto");

function objectId(value) {
  return { toString: () => value };
}

describe("eventDto", () => {
  test("serializes user references as current public user names", () => {
    expect(serializeUserReference({ userName: "nacho", _id: objectId("user-id") })).toBe("nacho");
    expect(serializeUserReference(objectId("user-id"))).toBe("user-id");
    expect(serializeUserReference(null)).toBeNull();
  });

  test("detects past event dates", () => {
    const now = new Date("2026-01-10T12:00:00.000Z");

    expect(isPastEventDate("2026-01-09T12:00:00.000Z", now)).toBe(true);
    expect(isPastEventDate("2026-01-11T12:00:00.000Z", now)).toBe(false);
    expect(isPastEventDate("bad-date", now)).toBe(false);
  });

  test("computes effective lifecycle statuses", () => {
    const now = new Date("2026-01-10T12:00:00.000Z");

    expect(getEffectiveEventStatus({ status: "cancelled", date: "2026-01-20", participants: 10, participantsList: [] }, now)).toBe(EVENT_STATUS.CANCELLED);
    expect(getEffectiveEventStatus({ status: "open", date: "2026-01-09", participants: 10, participantsList: [] }, now)).toBe(EVENT_STATUS.PAST);
    expect(getEffectiveEventStatus({ status: "open", date: "2026-01-20", participants: 2, participantsList: ["one", "two"] }, now)).toBe(EVENT_STATUS.FULL);
    expect(getEffectiveEventStatus({ status: "open", date: "2026-01-20", participants: 2, participantsList: ["one"] }, now)).toBe(EVENT_STATUS.OPEN);
  });

  test("returns null for empty events", () => {
    expect(toEventDto(null)).toBeNull();
  });

  test("serializes events without leaking internal fields", () => {
    const event = toEventDto({
      _id: objectId("event-id"),
      name: "Padel",
      description: "Match",
      sport: "Padel",
      date: "2026-01-01",
      locationName: "Court",
      location: "Valencia",
      city: "Valencia",
      participants: 4,
      participantsList: [{ userName: "nacho" }, objectId("other-id")],
      creator: { userName: "creator" },
      status: "open",
      dismissedBy: [{ userName: "marta" }],
      __v: 0,
      createdAt: "created",
      updatedAt: "updated",
    }, { now: new Date("2025-01-01") });

    expect(event).toEqual({
      _id: "event-id",
      id: "event-id",
      name: "Padel",
      description: "Match",
      sport: "Padel",
      date: "2026-01-01",
      locationName: "Court",
      location: "Valencia",
      city: "Valencia",
      participants: 4,
      participantsList: ["nacho", "other-id"],
      creator: "creator",
      status: "open",
      baseStatus: "open",
      dismissedBy: ["marta"],
      canJoin: true,
      isLocked: false,
      createdAt: "created",
      updatedAt: "updated",
    });
    expect(event).not.toHaveProperty("__v");
  });

  test("supports mongoose-like documents", () => {
    const event = {
      toObject: () => ({
        _id: objectId("event-id"),
        name: "Judo",
        date: "2026-01-20",
        participants: 2,
        creator: { userName: "creator" },
        participantsList: [{ userName: "player" }],
      }),
    };

    expect(toEventDto(event, { now: new Date("2026-01-01") })).toEqual(expect.objectContaining({
      _id: "event-id",
      id: "event-id",
      name: "Judo",
      creator: "creator",
      participantsList: ["player"],
      status: "open",
    }));
  });
});
