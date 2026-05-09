import React from "react";
import { render, screen } from "@testing-library/react";
import { getUserInitials, resolveProfileImageUrl, UserAvatar } from "./UserAvatar";

describe("UserAvatar", () => {
  test("builds initials from user names", () => {
    expect(getUserInitials("nacho")).toBe("NA");
    expect(getUserInitials(" a ")).toBe("A");
    expect(getUserInitials("")).toBe("?");
  });

  test("resolves only supported profile image paths", () => {
    expect(resolveProfileImageUrl("/uploads/profile-images/avatar.png")).toContain("/uploads/profile-images/avatar.png");
    expect(resolveProfileImageUrl("https://cdn.example/avatar.png")).toBe("https://cdn.example/avatar.png");
    expect(resolveProfileImageUrl("data:legacy-inline-image")).toBe("");
    expect(resolveProfileImageUrl("avatar.png")).toBe("");
    expect(resolveProfileImageUrl("")).toBe("");
  });

  test("renders initials when there is no profile image", () => {
    render(<UserAvatar userName="marta" />);

    expect(screen.getByText("MA")).toBeInTheDocument();
  });

  test("uses the provided uploaded profile image when available", () => {
    render(<UserAvatar userName="alex" profileImage="/uploads/profile-images/alex.png" />);

    expect(screen.getByAltText("alex")).toHaveAttribute("src", expect.stringContaining("/uploads/profile-images/alex.png"));
  });
});
