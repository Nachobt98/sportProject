import * as client from "./client";
import { getCurrentUser, getUser, updateCurrentUser } from "./usersApi";

jest.mock("./client");

describe("usersApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("gets a user by username", async () => {
    client.apiFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ userName: "nacho" }),
    });

    await expect(getUser("nacho")).resolves.toEqual({ userName: "nacho" });
    expect(client.apiFetch).toHaveBeenCalledWith("/api/user/nacho");
  });

  test("gets current user profile", async () => {
    client.apiFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ user: { userName: "nacho" } }),
    });

    await expect(getCurrentUser()).resolves.toEqual({ user: { userName: "nacho" } });
    expect(client.apiFetch).toHaveBeenCalledWith("/api/users/me");
  });

  test("updates current user profile", async () => {
    const payload = { firstName: "Nacho", profileImage: "data:image/png;base64,AAAA" };
    client.apiFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ user: payload }),
    });

    await expect(updateCurrentUser(payload)).resolves.toEqual({ user: payload });
    expect(client.apiFetch).toHaveBeenCalledWith(
      "/api/users/me",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(payload),
      })
    );
  });

  test("throws API errors", async () => {
    client.apiFetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: "User not found" }),
    });

    await expect(getUser("missing")).rejects.toThrow("User not found");
  });
});
