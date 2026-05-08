import React from "react";
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./authContext";
import * as authApi from "../api/authApi";

jest.mock("../api/authApi");
const mockSetUsers = jest.fn();
const mockDeleteUser = jest.fn();
const mockNavigate = jest.fn();

jest.mock("./userContext", () => ({
  useUser: () => ({ setUsers: mockSetUsers, deleteUser: mockDeleteUser }),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

function Consumer() {
  const { isAuthenticated, username, login, logout } = useAuth();
  return (
    <div>
      <span>{isAuthenticated ? "authenticated" : "anonymous"}</span>
      <span>{username}</span>
      <button onClick={() => login("nacho", "token")}>login</button>
      <button onClick={() => logout()}>logout</button>
      <button onClick={() => logout(false)}>logout silent</button>
    </div>
  );
}

function renderAuth() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("starts as anonymous without stored auth", () => {
    renderAuth();
    expect(screen.getByText("anonymous")).toBeInTheDocument();
  });

  test("stores login data", () => {
    renderAuth();
    fireEvent.click(screen.getByText("login"));

    expect(screen.getByText("authenticated")).toBeInTheDocument();
    expect(localStorage.getItem("auth")).toContain("token");
  });

  test("logs out and redirects", () => {
    renderAuth();
    fireEvent.click(screen.getByText("login"));
    fireEvent.click(screen.getByText("logout"));

    expect(mockDeleteUser).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("logs out without redirect", () => {
    renderAuth();
    fireEvent.click(screen.getByText("login"));
    fireEvent.click(screen.getByText("logout silent"));

    expect(mockDeleteUser).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("loads and validates stored sessions", async () => {
    localStorage.setItem("auth", JSON.stringify({ isAuthenticated: true, username: "nacho", token: "token" }));
    authApi.getCurrentSession.mockResolvedValue({ user: { userName: "nacho" } });

    renderAuth();

    expect(screen.getByText("authenticated")).toBeInTheDocument();
    await waitFor(() => expect(mockSetUsers).toHaveBeenCalledWith({ userName: "nacho" }));
  });

  test("clears invalid stored JSON", () => {
    localStorage.setItem("auth", "invalid-json");

    renderAuth();

    expect(screen.getByText("anonymous")).toBeInTheDocument();
    expect(localStorage.getItem("auth")).toBeNull();
  });

  test("handles unauthorized events", async () => {
    localStorage.setItem("auth", JSON.stringify({ isAuthenticated: true, username: "nacho", token: "token" }));
    authApi.getCurrentSession.mockResolvedValue({ user: { userName: "nacho" } });

    renderAuth();
    act(() => {
      window.dispatchEvent(new Event("sportlife:unauthorized"));
    });

    await waitFor(() => expect(mockDeleteUser).toHaveBeenCalled());
  });
});
