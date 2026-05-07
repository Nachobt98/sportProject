import * as client from "./client";
import {
  cancelEventJoin,
  createEvent,
  deleteEvent,
  getCurrentUserCreatedEvents,
  getCurrentUserJoinedEvents,
  getEventById,
  getEvents,
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
    const payload = { events: [{ _id: "1" }], pagination: { page: 1 } };
    mockJsonResponse(payload);
    await expect(getEvents()).resolves.toEqual(payload);
    expect(client.apiFetch).toHaveBeenCalledWith("/api/events");
  });

  test("gets filtered and paginated events", async () => {
    const payload = { events: [{ _id: "1" }], pagination: { page: 2, limit: 10 } };
    mockJsonResponse(payload);
    await expect(getEvents({ city: "Valencia", sport: "Padel", date: "2026-01-01", page: 2, limit: 10 })).resolves.toEqual(payload);
    expect(client.apiFetch).toHaveBeenCalledWith("/api/events?city=Valencia&sport=Padel&date=2026-01-01&page=2&limit=10");
  });

  test("ignores empty event filters", async () => {
    mockJsonResponse({ events: [], pagination: { page: 1 } });
    await getEvents({ city: "", sport: "Padel", date: "" });
    expect(client.apiFetch).toHaveBeenCalledWith("/api/events?sport=Padel");
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

  test("gets current user event lists", async () => {
    mockJsonResponse([]);
    await getCurrentUserCreatedEvents();
    expect(client.apiFetch).toHaveBeenLastCalledWith("/api/users/me/events");

    await getCurrentUserJoinedEvents();
    expect(client.apiFetch).toHaveBeenLastCalledWith("/api/users/me/joined-events");
  });
});
