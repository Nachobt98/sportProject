import * as client from "./client";
import { getUser } from "./usersApi";

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

  test("throws API errors", async () => {
    client.apiFetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: "User not found" }),
    });

    await expect(getUser("missing")).rejects.toThrow("User not found");
  });
});
