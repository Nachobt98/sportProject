import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "./login";
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

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders login form", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: /inicia sesion/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contrasena/i)).toBeInTheDocument();
  });

  test("submits login successfully", async () => {
    authApi.loginUser.mockResolvedValue({
      username: "nacho",
      token: "token",
      user: { userName: "nacho" },
    });

    renderLogin();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "nacho" } });
    fireEvent.change(screen.getByLabelText(/contrasena/i), { target: { value: "Input123" } });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => expect(authApi.loginUser).toHaveBeenCalled());
    expect(mockLogin).toHaveBeenCalledWith("nacho", "token");
    expect(mockAddUser).toHaveBeenCalledWith({ userName: "nacho" });
    expect(mockNavigate).toHaveBeenCalledWith("/homepage");
  });

  test("shows login errors", async () => {
    authApi.loginUser.mockRejectedValue(new Error("Credenciales no validas"));

    renderLogin();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "nacho" } });
    fireEvent.change(screen.getByLabelText(/contrasena/i), { target: { value: "bad" } });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText("Credenciales no validas")).toBeInTheDocument();
  });
});
