import * as client from "./client";
import { getCurrentSession, loginUser, registerUser } from "./authApi";

jest.mock("./client");

describe("authApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockJsonResponse(body, ok = true) {
    client.apiFetch.mockResolvedValue({ ok, json: jest.fn().mockResolvedValue(body) });
  }

  test("logs in users", async () => {
    mockJsonResponse({ username: "nacho", token: "token" });
    await expect(loginUser({ userName: "nacho", password: "pass" })).resolves.toEqual({
      username: "nacho",
      token: "token",
    });
    expect(client.apiFetch).toHaveBeenCalledWith("/api/login", expect.objectContaining({ method: "POST" }));
  });

  test("registers users", async () => {
    mockJsonResponse({ user: { userName: "nacho" }, token: "token" });
    await registerUser({ userName: "nacho" });
    expect(client.apiFetch).toHaveBeenCalledWith("/api/register", expect.objectContaining({ method: "POST" }));
  });

  test("gets current session", async () => {
    mockJsonResponse({ user: { userName: "nacho" } });
    await expect(getCurrentSession()).resolves.toEqual({ user: { userName: "nacho" } });
    expect(client.apiFetch).toHaveBeenCalledWith("/api/session");
  });

  test("throws response errors", async () => {
    mockJsonResponse({ message: "Invalid credentials" }, false);
    await expect(loginUser({})).rejects.toThrow("Invalid credentials");
  });
});
