import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DropdownMenu } from "./dropDownMenu";

const mockLogout = jest.fn();
const mockDeleteUser = jest.fn();

jest.mock("../context/authContext", () => ({
  useAuth: () => ({ logout: mockLogout }),
}));

jest.mock("../context/userContext", () => ({
  useUser: () => ({
    users: {
      userName: "nacho",
      profileImage: "data:image/png;base64,AAAA",
    },
    deleteUser: mockDeleteUser,
  }),
}));

function renderMenu() {
  return render(
    <MemoryRouter>
      <DropdownMenu navItems={[{ label: "Eventos", path: "/events", icon: <span /> }]} />
    </MemoryRouter>
  );
}

describe("DropdownMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("uses the user avatar as trigger", () => {
    renderMenu();

    expect(screen.getByRole("button", { name: /abrir menu de usuario/i })).toBeInTheDocument();
    expect(screen.queryByTestId("MenuIcon")).not.toBeInTheDocument();
  });

  test("opens menu from avatar and logs out", () => {
    renderMenu();

    fireEvent.click(screen.getByRole("button", { name: /abrir menu de usuario/i }));
    expect(screen.getByText("Mi perfil")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Logout"));
    expect(mockDeleteUser).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
  });
});
