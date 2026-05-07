import * as client from "./client";
import {
  cancelEventJoin,
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  getUserCreatedEvents,
  getUserJoinedEvents,
  joinEvent,
} from "./eventsApi";

jest.mock("./client");

describe("eventsApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockJsonResponse(body, ok = true) {
    client.apiFetch.mockResolvedValue({ ok, json: jest.fn().mockResolvedValue(body) });
  }

  test("gets events", async () => {
    mockJsonResponse([{ _id: "1" }]);
    await expect(getEvents()).resolves.toEqual([{ _id: "1" }]);
    expect(client.apiFetch).toHaveBeenCalledWith("/api/events");
  });

  test("gets event details", async () => {
    mockJsonResponse({ event: { _id: "123" } });
    await expect(getEventById("123")).resolves.toEqual({ event: { _id: "123" } });
    expect(client.apiFetch).toHaveBeenCalledWith("/api/events/123");
  });

  test("creates events", async () => {
    const eventData = { name: "Padel" };
    mockJsonResponse({ event: eventData });
    await createEvent(eventData);
    expect(client.apiFetch).toHaveBeenCalledWith("/api/events", expect.objectContaining({ method: "POST" }));
  });

  test("deletes events", async () => {
    mockJsonResponse({ eventId: "123" });
    await deleteEvent("123");
    expect(client.apiFetch).toHaveBeenCalledWith("/api/events/123", { method: "DELETE" });
  });

  test("joins and cancels event participation", async () => {
    mockJsonResponse({ event: { _id: "123" } });
    await joinEvent("123");
    expect(client.apiFetch).toHaveBeenLastCalledWith("/api/events/123/join", { method: "POST" });

    await cancelEventJoin("123");
    expect(client.apiFetch).toHaveBeenLastCalledWith("/api/events/123/join", { method: "DELETE" });
  });

  test("gets profile event lists", async () => {
    mockJsonResponse([]);
    await getUserCreatedEvents("nacho");
    expect(client.apiFetch).toHaveBeenLastCalledWith("/api/user/nacho/events");

    await getUserJoinedEvents("nacho");
    expect(client.apiFetch).toHaveBeenLastCalledWith("/api/user/nacho/joinedEvents");
  });
});
