import React from "react";
import { render, screen } from "@testing-library/react";
import { Home } from "./home";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

test("renders home dashboard", () => {
  render(<Home />);

  expect(screen.getByRole("heading", { name: /encuentra gente para moverte/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /buscar eventos/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /crear evento/i })).toBeInTheDocument();
  expect(screen.getByText(/eventos disponibles/i)).toBeInTheDocument();
  expect(screen.getByText(/deportes populares/i)).toBeInTheDocument();
  expect(screen.getByText(/actividad semanal/i)).toBeInTheDocument();
});
