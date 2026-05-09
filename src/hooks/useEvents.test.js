import { normalizeEventsResponse } from "./useEvents";
import { queryKeys } from "./queryKeys";

describe("event query helpers", () => {
  test("normalizes legacy array event responses", () => {
    const events = [{ _id: "event-id", name: "Padel" }];

    expect(normalizeEventsResponse(events)).toEqual({
      events,
      pagination: null,
    });
  });

  test("normalizes paginated event responses", () => {
    const response = {
      events: [{ _id: "event-id", name: "Padel" }],
      pagination: { page: 1, total: 1 },
    };

    expect(normalizeEventsResponse(response)).toEqual(response);
  });

  test("normalizes empty or malformed event responses defensively", () => {
    expect(normalizeEventsResponse(null)).toEqual({ events: [], pagination: null });
    expect(normalizeEventsResponse({})).toEqual({ events: [], pagination: null });
  });

  test("builds stable query key namespaces", () => {
    expect(queryKeys.events.all).toEqual(["events"]);
    expect(queryKeys.events.detail("event-id")).toEqual(["events", "detail", "event-id"]);
    expect(queryKeys.events.created("nacho")).toEqual(["events", "profile", "nacho", "created"]);
    expect(queryKeys.events.joined("nacho")).toEqual(["events", "profile", "nacho", "joined"]);
  });
});
