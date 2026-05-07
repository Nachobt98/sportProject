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

function renderHeader(path = "/homepage") {
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

  test("does not render on public auth pages", () => {
    const { container } = renderHeader("/");
    expect(container).toBeEmptyDOMElement();
  });

  test("renders navigation and avatar menu for authenticated users", () => {
    renderHeader("/homepage");

    expect(screen.getByText("SportLife")).toBeInTheDocument();
    expect(screen.getByText("Calendario")).toBeInTheDocument();
    expect(screen.getByText("Eventos")).toBeInTheDocument();
    expect(screen.getByTestId("avatar-menu")).toHaveTextContent("4");
  });

  test("renders login actions for anonymous users", () => {
    mockIsAuthenticated = false;

    renderHeader("/homepage");

    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Registro" })).toBeInTheDocument();
    expect(screen.queryByTestId("avatar-menu")).not.toBeInTheDocument();
  });
});
