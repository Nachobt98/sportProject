import * as client from "./client";
import { getCurrentUser, updateCurrentUser, uploadProfileImage } from "./usersApi";

jest.mock("./client");

describe("usersApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("gets current user profile", async () => {
    client.apiFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ user: { userName: "nacho" } }),
    });

    await expect(getCurrentUser()).resolves.toEqual({ user: { userName: "nacho" } });
    expect(client.apiFetch).toHaveBeenCalledWith("/api/users/me");
  });

  test("updates current user profile without profile image payload", async () => {
    const payload = { firstName: "Nacho", email: "nacho@example.com" };
    client.apiFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ user: payload }),
    });

    await expect(updateCurrentUser(payload)).resolves.toEqual({ user: payload });
    expect(client.apiFetch).toHaveBeenCalledWith(
      "/api/users/me",
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );
  });

  test("uploads profile images with multipart form data", async () => {
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    client.apiFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ user: { profileImage: "/uploads/profile-images/avatar.png" } }),
    });

    await expect(uploadProfileImage(file)).resolves.toEqual({ user: { profileImage: "/uploads/profile-images/avatar.png" } });
    expect(client.apiFetch).toHaveBeenCalledWith(
      "/api/users/me/profile-image",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      })
    );
    const [, options] = client.apiFetch.mock.calls[0];
    expect(options.body.get("profileImage")).toBe(file);
  });

  test("throws API errors", async () => {
    client.apiFetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: "User not found" }),
    });

    await expect(getCurrentUser()).rejects.toThrow("User not found");
  });
});
