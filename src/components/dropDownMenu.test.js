import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DropdownMenu } from "./dropDownMenu";

const mockLogout = jest.fn();
const mockDeleteUser = jest.fn();
let mockUsers = {
  userName: "nacho",
  profileImage: "/uploads/profile-images/nacho.png",
};

jest.mock("../context/authContext", () => ({
  useAuth: () => ({ logout: mockLogout }),
}));

jest.mock("../context/userContext", () => ({
  useUser: () => ({
    users: mockUsers,
    deleteUser: mockDeleteUser,
  }),
}));

function renderMenu(navItems = [{ label: "Eventos", path: "/events", icon: <span /> }]) {
  return render(
    <MemoryRouter>
      <DropdownMenu navItems={navItems} />
    </MemoryRouter>
  );
}

describe("DropdownMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsers = {
      userName: "nacho",
      profileImage: "/uploads/profile-images/nacho.png",
    };
  });

  test("uses the user avatar as trigger", () => {
    renderMenu();

    expect(screen.getByRole("button", { name: /abrir menu de usuario/i })).toBeInTheDocument();
    expect(screen.queryByTestId("MenuIcon")).not.toBeInTheDocument();
  });

  test("opens menu from avatar and logs out", () => {
    renderMenu();

    fireEvent.click(screen.getByRole("button", { name: /abrir menu de usuario/i }));
    expect(screen.getByText("Eventos")).toBeInTheDocument();
    expect(screen.getByText("Mi perfil")).toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Logout"));
    expect(mockDeleteUser).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
  });

  test("renders initials fallback when the user has no image", () => {
    mockUsers = { userName: "dev", profileImage: "" };

    renderMenu([]);

    expect(screen.getByText("DE")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /abrir menu de usuario/i }));
    expect(screen.getByText("Mi perfil")).toBeInTheDocument();
  });

  test("falls back to a generic avatar initial when username is empty", () => {
    mockUsers = { userName: "", profileImage: "" };

    renderMenu([]);

    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
