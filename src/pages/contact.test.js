import React from "react";
import { render, screen } from "@testing-library/react";
import { Contact, handleContactSubmit } from "./contact";

test("renders the contact form and support details", () => {
  render(<Contact />);

  expect(screen.getByRole("heading", { name: /contacto/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/correo electronico/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument();
  expect(screen.getByText("93 767 786 7867")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /enviar mensaje/i })).toBeInTheDocument();
});

test("marks successful contact submissions and resets the form", () => {
  const resetForm = jest.fn();
  const setStatus = jest.fn();

  handleContactSubmit({}, { resetForm, setStatus });

  expect(setStatus).toHaveBeenCalledWith("Mensaje preparado correctamente.");
  expect(resetForm).toHaveBeenCalled();
});
