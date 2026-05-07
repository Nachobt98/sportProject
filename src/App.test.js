import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

jest.mock("./api/authApi", () => ({
  getCurrentSession: jest.fn().mockResolvedValue({ user: { userName: "nacho" } }),
  loginUser: jest.fn(),
  registerUser: jest.fn(),
}));

jest.mock("./components/header", () => ({
  Header: () => <div>Header mocked</div>,
}));
jest.mock("./pages/articles", () => ({ Article: () => <div>Article page</div> }));
jest.mock("./pages/calendar", () => ({ Calendar: () => <div>Calendar page</div> }));
jest.mock("./pages/CardDetails", () => () => <div>Card details page</div>);
jest.mock("./pages/contact", () => ({ Contact: () => <div>Contact page</div> }));
jest.mock("./pages/CreateEvent", () => ({ CreateEvent: () => <div>Create event page</div> }));
jest.mock("./pages/faqPage", () => ({ FaqPage: () => <div>FAQ page</div> }));
jest.mock("./pages/home", () => ({ Home: () => <div>Home page</div> }));
jest.mock("./pages/perfil", () => ({ Perfil: () => <div>Profile page</div> }));
jest.mock("./pages/register", () => ({ RegisterPage: () => <div>Register page</div> }));
jest.mock("./pages/searchCard", () => ({ SearchCard: () => <div>Legacy search page</div> }));
jest.mock("./pages/searchCard2", () => ({ SearchCard2: () => <div>Search page</div> }));

beforeEach(() => {
  localStorage.clear();
});

test("renders the login screen", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole("heading", { name: /inicia sesion/i })).toBeInTheDocument();
});

test("redirects anonymous users away from protected routes", () => {
  render(
    <MemoryRouter initialEntries={["/homepage"]}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole("heading", { name: /inicia sesion/i })).toBeInTheDocument();
});

test("renders protected routes for authenticated users", async () => {
  localStorage.setItem(
    "auth",
    JSON.stringify({ isAuthenticated: true, username: "nacho", token: "token" })
  );

  render(
    <MemoryRouter initialEntries={["/article"]}>
      <App />
    </MemoryRouter>
  );

  expect(await screen.findByText("Article page")).toBeInTheDocument();
});

test("redirects unknown routes to login", () => {
  render(
    <MemoryRouter initialEntries={["/unknown"]}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole("heading", { name: /inicia sesion/i })).toBeInTheDocument();
});
