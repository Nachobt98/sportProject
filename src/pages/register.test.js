import React from "react";
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  function createFile({ type = "image/png", size = 1000 } = {}) {
    const file = new File([new Array(size).fill("a").join("")], "test.png", { type });
    Object.defineProperty(file, "size", { value: size });
    return file;
  }

  test("accepts valid profile image", async () => {
    const { container } = renderRegister();
    const file = createFile({ type: "image/png", size: 1000 });
    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.queryByText(/la imagen debe ser/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/la imagen es demasiado grande/i)).not.toBeInTheDocument();
  });

  test("rejects image with invalid type", async () => {
    const { container } = renderRegister();
    const file = createFile({ type: "image/gif", size: 1000 });
    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/la imagen debe ser JPG, PNG o WEBP/i)).toBeInTheDocument();
  });

  test("rejects image that is too large", async () => {
    const { container } = renderRegister();
    const file = createFile({ type: "image/png", size: 2 * 1024 * 1024 });
    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/la imagen es demasiado grande/i)).toBeInTheDocument();
  });

  test("shows error if file reading fails", async () => {
    const { container } = renderRegister();
    const file = createFile({ type: "image/png", size: 1000 });
    const input = container.querySelector('input[type="file"]');
    const originalFileReader = window.FileReader;
    function MockFileReader() {
      this.readAsDataURL = function () {
        this.onerror();
      };
      setTimeout(() => this.onerror && this.onerror(), 0);
    }
    window.FileReader = MockFileReader;
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/no se pudo leer la imagen seleccionada/i)).toBeInTheDocument();
    window.FileReader = originalFileReader;
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

    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(mockNavigate).toHaveBeenCalledWith("/home");
    jest.useRealTimers();
  });

  test("shows register validation errors", async () => {
    renderRegister();
    fireEvent.click(screen.getByRole("button", { name: /registrarse/i }));

    expect(await screen.findByText(/nombre requerido/i)).toBeInTheDocument();
  });
});
