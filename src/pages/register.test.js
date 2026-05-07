import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RegisterPage } from "./register";
import * as authApi from "../api/authApi";

jest.mock("../api/authApi");
const addUser = jest.fn();
const login = jest.fn();
const navigate = jest.fn();

jest.mock("../context/userContext", () => ({
  useUser: () => ({ addUser }),
}));
jest.mock("../context/authContext", () => ({
  useAuth: () => ({ login }),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => navigate,
}));

function renderRegister() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );
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

    renderRegister();
    fireEvent.change(screen.getByRole("textbox", { name: "" }), { target: { name: "firstName", value: "Nacho" } });
    fireEvent.change(screen.getAllByRole("textbox")[1], { target: { name: "lastName", value: "Bru" } });
    fireEvent.change(screen.getAllByRole("textbox")[2], { target: { name: "userName", value: "nacho" } });
    fireEvent.change(screen.getAllByRole("textbox")[3], { target: { name: "city", value: "Valencia" } });
    fireEvent.change(screen.getAllByRole("textbox")[4], { target: { name: "email", value: "nacho@example.com" } });
    fireEvent.change(screen.getByLabelText(/contrasena/i), { target: { name: "password", value: "Input123" } });
    fireEvent.change(screen.getByLabelText(/fecha de nacimiento/i), { target: { name: "birthdate", value: "1998-10-20" } });
    fireEvent.click(screen.getByRole("button", { name: /registrarse/i }));

    await waitFor(() => expect(authApi.registerUser).toHaveBeenCalled());
    expect(addUser).toHaveBeenCalledWith({ userName: "nacho" });
    expect(login).toHaveBeenCalledWith("nacho", "token");

    jest.runOnlyPendingTimers();
    expect(navigate).toHaveBeenCalledWith("/homepage");
    jest.useRealTimers();
  });

  test("shows register errors", async () => {
    authApi.registerUser.mockRejectedValue(new Error("Ya existe un usuario"));

    renderRegister();
    fireEvent.click(screen.getByRole("button", { name: /registrarse/i }));

    expect(await screen.findByText(/nombre requerido/i)).toBeInTheDocument();
  });
});
