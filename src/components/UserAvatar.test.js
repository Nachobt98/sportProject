import React from "react";
import { render, screen } from "@testing-library/react";
import { getUserInitials, UserAvatar } from "./UserAvatar";

describe("UserAvatar", () => {
  test("builds initials from user names", () => {
    expect(getUserInitials("nacho")).toBe("NA");
    expect(getUserInitials(" a ")).toBe("A");
    expect(getUserInitials("")).toBe("?");
  });

  test("renders initials when there is no profile image", () => {
    render(<UserAvatar userName="marta" />);

    expect(screen.getByText("MA")).toBeInTheDocument();
  });

  test("uses the provided profile image when available", () => {
    render(<UserAvatar userName="alex" profileImage="data:image/png;base64,AAAA" />);

    expect(screen.getByAltText("alex")).toHaveAttribute("src", "data:image/png;base64,AAAA");
  });
});
