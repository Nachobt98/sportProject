import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  test("renders confirmation copy and calls actions", () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    render(
      <ConfirmDialog
        open
        title="Eliminar evento"
        description="Esta accion no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Mantener"
        severity="error"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText("Eliminar evento")).toBeInTheDocument();
    expect(screen.getByText("Esta accion no se puede deshacer.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /mantener/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /eliminar/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test("disables actions while confirming", () => {
    render(
      <ConfirmDialog
        open
        title="Cancelar evento"
        description="El evento quedara bloqueado."
        confirmLabel="Cancelar evento"
        isConfirming
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /volver/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /procesando/i })).toBeDisabled();
  });
});
