import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Header } from "./header";

let mockIsAuthenticated = true;

jest.mock("../context/authContext", () => ({
  useAuth: () => ({ isAuthenticated: mockIsAuthenticated }),
}));

jest.mock("./dropDownMenu", () => ({
  DropdownMenu: ({ navItems }) => <div data-testid="avatar-menu">{navItems.length}</div>,
}));

function renderHeader(path = "/home") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>
  );
}

describe("Header", () => {
  beforeEach(() => {
    mockIsAuthenticated = true;
  });

  test("does not render on login page", () => {
    const { container } = renderHeader("/login");
    expect(container).toBeEmptyDOMElement();
  });

  test("does not render on registration page", () => {
    const { container } = renderHeader("/register");
    expect(container).toBeEmptyDOMElement();
  });

  test("renders navigation and avatar menu for authenticated users", () => {
    renderHeader("/home");

    expect(screen.getByText("SportLife")).toBeInTheDocument();
    expect(screen.getByText("Calendario")).toBeInTheDocument();
    expect(screen.getByText("Eventos")).toBeInTheDocument();
    expect(screen.getByTestId("avatar-menu")).toHaveTextContent("4");
  });

  test("renders login actions for anonymous users", () => {
    mockIsAuthenticated = false;

    renderHeader("/home");

    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Registro" })).toBeInTheDocument();
    expect(screen.queryByTestId("avatar-menu")).not.toBeInTheDocument();
  });

  test("marks the active navigation item", () => {
    renderHeader("/events");

    expect(screen.getByRole("link", { name: /eventos/i })).toBeInTheDocument();
  });
});
