import { apiFetch } from "./client";

describe("apiFetch", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn().mockResolvedValue({ status: 200 });
    jest.spyOn(window, "dispatchEvent");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("adds bearer token when auth is stored", async () => {
    localStorage.setItem("auth", JSON.stringify({ token: "abc" }));
    await apiFetch("/api/events", { headers: { "Content-Type": "application/json" } });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/events",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer abc",
          "Content-Type": "application/json",
        }),
      })
    );
  });

  test("dispatches unauthorized event for protected 401 responses", async () => {
    global.fetch.mockResolvedValue({ status: 401 });
    await apiFetch("/api/events");

    expect(window.dispatchEvent).toHaveBeenCalledWith(expect.any(Event));
  });

  test("does not dispatch unauthorized event for public paths", async () => {
    global.fetch.mockResolvedValue({ status: 401 });
    await apiFetch("/api/login");

    expect(window.dispatchEvent).not.toHaveBeenCalled();
  });
});
