import React from "react";
import { render, screen } from "@testing-library/react";
import { Testimonio } from "./testimonio";

test("renders testimonial content", () => {
  render(<Testimonio foto="avatar.png" nombre="Nacho" mensaje="Gran experiencia" />);

  expect(screen.getByText("Nacho")).toBeInTheDocument();
  expect(screen.getByText("Gran experiencia")).toBeInTheDocument();
});
