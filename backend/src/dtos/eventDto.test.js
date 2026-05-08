const { toEventDto, serializeUserReference } = require("./eventDto");

function objectId(value) {
  return { toString: () => value };
}

describe("eventDto", () => {
  test("serializes user references as current public user names", () => {
    expect(serializeUserReference({ userName: "nacho", _id: objectId("user-id") })).toBe("nacho");
    expect(serializeUserReference(objectId("user-id"))).toBe("user-id");
    expect(serializeUserReference(null)).toBeNull();
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
      __v: 0,
      createdAt: "created",
      updatedAt: "updated",
    });

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
        creator: { userName: "creator" },
        participantsList: [{ userName: "player" }],
      }),
    };

    expect(toEventDto(event)).toEqual(expect.objectContaining({
      _id: "event-id",
      id: "event-id",
      name: "Judo",
      creator: "creator",
      participantsList: ["player"],
    }));
  });
});
