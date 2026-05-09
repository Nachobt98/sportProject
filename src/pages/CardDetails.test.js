import React from "react";
import { screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CardDetails from "./CardDetails";
import * as eventsApi from "../api/eventsApi";
import { renderWithQueryClient } from "../testUtils/renderWithQueryClient";

jest.mock("../api/eventsApi");
const mockNavigate = jest.fn();

jest.mock("../context/userContext", () => ({
  useUser: () => ({ users: { userName: "nacho" } }),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const baseEvent = {
  _id: "event-id",
  name: "Padel match",
  description: "Friendly match",
  sport: "Padel",
  date: "2026-01-01T00:00:00.000Z",
  city: "Valencia",
  location: "Club Valencia",
  locationName: "Court 1",
  creator: "nacho",
  participants: 4,
  participantsList: ["player1"],
  status: "open",
};

function renderDetails(path = "/events/event-id") {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/events/:eventId" element={<CardDetails />} />
        <Route path="/events" element={<div>Events page</div>} />
        <Route path="/profile" element={<div>Profile page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

async function confirmAction(nameMatcher) {
  const dialog = await screen.findByRole("dialog");
  fireEvent.click(within(dialog).getByRole("button", { name: nameMatcher }));
}

describe("CardDetails", () => {
  beforeEach(() => jest.clearAllMocks());

  test("loads and renders event details", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: baseEvent });
    renderDetails();

    expect(screen.getByText(/cargando evento/i)).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Padel match" })).toBeInTheDocument();
    expect(eventsApi.getEventById).toHaveBeenCalledWith("event-id");
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("player1")).toBeInTheDocument();
  });

  test("renders full and cancelled lifecycle states", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: { ...baseEvent, status: "full", participants: 1 } });
    const { unmount } = renderDetails();

    expect(await screen.findByText("Full")).toBeInTheDocument();
    expect(screen.getByText(/evento esta completo/i)).toBeInTheDocument();

    unmount();
    jest.clearAllMocks();
    eventsApi.getEventById.mockResolvedValue({ event: { ...baseEvent, status: "cancelled" } });
    renderDetails();

    expect(await screen.findByText("Cancelled")).toBeInTheDocument();
    expect(screen.getByText(/ha sido cancelado/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /editar/i })).not.toBeInTheDocument();
  });

  test("navigates to edit and back", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: baseEvent });
    renderDetails();

    fireEvent.click(await screen.findByRole("button", { name: /editar/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/events/event-id/edit");

    fireEvent.click(screen.getByRole("button", { name: /volver/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/events");
  });

  test("renders participant and location fallbacks", async () => {
    eventsApi.getEventById.mockResolvedValue({
      event: { ...baseEvent, creator: "", location: "", locationName: "", participantsList: [] },
    });
    renderDetails();

    expect(await screen.findByText("Usuario desconocido")).toBeInTheDocument();
    expect(screen.getByText(/todavia no hay participantes/i)).toBeInTheDocument();
    expect(screen.getByText("Ubicacion no indicada")).toBeInTheDocument();
  });

  test("renders external location links", async () => {
    eventsApi.getEventById.mockResolvedValue({
      event: { ...baseEvent, location: "https://maps.example/event", locationName: "" },
    });
    renderDetails();

    expect(await screen.findByRole("link", { name: "https://maps.example/event" })).toHaveAttribute("href", "https://maps.example/event");
  });

  test("confirms event cancellation", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: baseEvent });
    eventsApi.cancelEvent.mockResolvedValue({ event: { ...baseEvent, status: "cancelled" } });
    renderDetails();

    fireEvent.click(await screen.findByRole("button", { name: /cancelar evento/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await confirmAction(/^cancelar evento$/i);

    await waitFor(() => expect(eventsApi.cancelEvent).toHaveBeenCalledWith("event-id"));
  });

  test("shows cancellation errors after confirmation", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: baseEvent });
    eventsApi.cancelEvent.mockRejectedValue(new Error("No se pudo cancelar"));
    renderDetails();

    fireEvent.click(await screen.findByRole("button", { name: /cancelar evento/i }));
    await confirmAction(/^cancelar evento$/i);
    expect(await screen.findByText("No se pudo cancelar")).toBeInTheDocument();
  });

  test("confirms profile dismissal", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: { ...baseEvent, status: "past" } });
    eventsApi.dismissEvent.mockResolvedValue({ eventId: "event-id" });
    renderDetails();

    fireEvent.click(await screen.findByRole("button", { name: /borrar de mi perfil/i }));
    await confirmAction(/^borrar de mi perfil$/i);

    await waitFor(() => expect(eventsApi.dismissEvent).toHaveBeenCalledWith("event-id"));
    expect(mockNavigate).toHaveBeenCalledWith("/profile", { replace: true });
  });

  test("confirms global deletion", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: baseEvent });
    eventsApi.deleteEvent.mockResolvedValue({ eventId: "event-id" });
    renderDetails();

    fireEvent.click(await screen.findByRole("button", { name: /eliminar globalmente/i }));
    await confirmAction(/^eliminar globalmente$/i);

    await waitFor(() => expect(eventsApi.deleteEvent).toHaveBeenCalledWith("event-id"));
    expect(mockNavigate).toHaveBeenCalledWith("/profile", { replace: true });
  });

  test("past events can navigate to date edit", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: { ...baseEvent, status: "past" } });
    renderDetails();

    expect(await screen.findByText("Past")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cambiar fecha/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/events/event-id/edit");
  });

  test("uses shared error and empty states", async () => {
    eventsApi.getEventById.mockRejectedValue(new Error("Evento no encontrado"));
    const { unmount } = renderDetails();

    expect(await screen.findByText("Evento no encontrado")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /volver a eventos/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/events");

    unmount();
    jest.clearAllMocks();
    eventsApi.getEventById.mockResolvedValue({ event: null });
    renderDetails();
    expect(await screen.findByText("Evento no encontrado")).toBeInTheDocument();
  });

  test("shows error when route has no event id", async () => {
    renderDetails("/events");

    expect(await screen.findByText("No se ha indicado ningun evento.")).toBeInTheDocument();
    expect(eventsApi.getEventById).not.toHaveBeenCalled();
  });
});
