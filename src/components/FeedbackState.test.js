import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { EmptyState, ErrorState, LoadingState } from "./FeedbackState";

describe("FeedbackState components", () => {
  test("renders loading state", () => {
    render(<LoadingState title="Cargando eventos" description="Preparando la lista." />);

    expect(screen.getByText("Cargando eventos")).toBeInTheDocument();
    expect(screen.getByText("Preparando la lista.")).toBeInTheDocument();
  });

  test("renders empty state with action", () => {
    render(<EmptyState title="Sin eventos" description="Todavia no hay actividad." action={<button type="button">Crear</button>} />);

    expect(screen.getByText("Sin eventos")).toBeInTheDocument();
    expect(screen.getByText("Todavia no hay actividad.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear/i })).toBeInTheDocument();
  });

  test("renders error state action", () => {
    const onAction = jest.fn();
    render(<ErrorState title="Error" message="No se pudo cargar." actionLabel="Reintentar" onAction={onAction} />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("No se pudo cargar.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /reintentar/i }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
