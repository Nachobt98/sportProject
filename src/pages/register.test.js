import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RegisterPage } from "./register";
import * as authApi from "../api/authApi";

jest.mock("../api/authApi");
const mockAddUser = jest.fn();
const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock("../context/userContext", () => ({
  useUser: () => ({ addUser: mockAddUser }),
}));
jest.mock("../context/authContext", () => ({
  useAuth: () => ({ login: mockLogin }),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

function renderRegister() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );
}

function fillField(container, name, value) {
  fireEvent.change(container.querySelector(`[name="${name}"]`), {
    target: { name, value },
  });
}

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("renders register form", () => {
    renderRegister();
    expect(screen.getByRole("heading", { name: /crea tu cuenta/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /registrarse/i })).toBeInTheDocument();
  });

  test("registers users successfully", async () => {
    jest.useFakeTimers();
    authApi.registerUser.mockResolvedValue({
      user: { userName: "nacho" },
      token: "token",
    });

    const { container } = renderRegister();
    fillField(container, "firstName", "Nacho");
    fillField(container, "lastName", "Bru");
    fillField(container, "userName", "nacho");
    fillField(container, "city", "Valencia");
    fillField(container, "email", "nacho@example.com");
    fillField(container, "password", "Input123");
    fillField(container, "birthdate", "1998-10-20");
    fireEvent.click(screen.getByRole("button", { name: /registrarse/i }));

    await waitFor(() => expect(authApi.registerUser).toHaveBeenCalled());
    expect(mockAddUser).toHaveBeenCalledWith({ userName: "nacho" });
    expect(mockLogin).toHaveBeenCalledWith("nacho", "token");

    jest.runOnlyPendingTimers();
    expect(mockNavigate).toHaveBeenCalledWith("/home");
    jest.useRealTimers();
  });

  test("shows register validation errors", async () => {
    renderRegister();
    fireEvent.click(screen.getByRole("button", { name: /registrarse/i }));

    expect(await screen.findByText(/nombre requerido/i)).toBeInTheDocument();
  });
});
