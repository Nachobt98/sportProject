import React from "react";
import { render, screen } from "@testing-library/react";
import { Article } from "./articles";

test("renders article placeholder", () => {
  render(<Article />);

  expect(screen.getByRole("heading", { name: /esto es articulo/i })).toBeInTheDocument();
});
