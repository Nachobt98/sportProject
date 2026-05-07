import React from "react";
import { render, screen } from "@testing-library/react";
import { Home } from "./home";

jest.mock("../components/carousel", () => ({
  Carousel: () => <div>Carousel mocked</div>,
}));

test("renders home testimonials", () => {
  render(<Home />);

  expect(screen.getByText("Carousel mocked")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /comunidad deportiva local/i })).toBeInTheDocument();
  expect(screen.getByText("Nacho Bru Tarin")).toBeInTheDocument();
  expect(screen.getByText("Adrian Perez Lopez")).toBeInTheDocument();
  expect(screen.getByText("Raul Fernandez Iglesias")).toBeInTheDocument();
});
