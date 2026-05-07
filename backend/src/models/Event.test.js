const { TextDecoder, TextEncoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const Event = require("./Event");

describe("Event model", () => {
  test("enables timestamps", () => {
    expect(Event.schema.path("createdAt")).toBeDefined();
    expect(Event.schema.path("updatedAt")).toBeDefined();
  });

  test("defines indexes for event list queries", () => {
    const indexFields = Event.schema.indexes().map(([fields]) => fields);

    expect(indexFields).toEqual(
      expect.arrayContaining([
        { date: 1, _id: 1 },
        { city: 1, sport: 1, date: 1, _id: 1 },
        { creator: 1, date: 1, _id: 1 },
      ])
    );
  });
});
