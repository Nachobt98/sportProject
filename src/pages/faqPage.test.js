import React from "react";
import { render, screen } from "@testing-library/react";
import { FaqPage } from "./faqPage";

test("renders FAQ entries", () => {
  render(<FaqPage />);

  expect(screen.getByRole("heading", { name: /preguntas frecuentes/i })).toBeInTheDocument();
  expect(screen.getByText(/como puedo registrarme/i)).toBeInTheDocument();
  expect(screen.getByText(/como contacto con el organizador/i)).toBeInTheDocument();
});
