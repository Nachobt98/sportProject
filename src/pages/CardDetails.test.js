import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CardDetails from "./CardDetails";
import * as eventsApi from "../api/eventsApi";

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
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/events/:eventId" element={<CardDetails />} />
        <Route path="/events" element={<div>Events page</div>} />
        <Route path="/profile" element={<div>Profile page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("CardDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loads and renders event details from the route id", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: baseEvent });
    renderDetails();

    expect(screen.getByText(/cargando evento/i)).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Padel match" })).toBeInTheDocument();
    expect(eventsApi.getEventById).toHaveBeenCalledWith("event-id");
    expect(screen.getByText("Friendly match")).toBeInTheDocument();
    expect(screen.getByText("player1")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  test("renders full event details and keeps active creator actions", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: { ...baseEvent, status: "full", participants: 1 } });
    renderDetails();

    expect(await screen.findByText("Full")).toBeInTheDocument();
    expect(screen.getByText(/este evento esta completo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar evento/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /eliminar globalmente/i })).toBeInTheDocument();
  });

  test("renders cancelled event details without edit or global delete actions", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: { ...baseEvent, status: "cancelled" } });
    renderDetails();

    expect(await screen.findByText("Cancelled")).toBeInTheDocument();
    expect(screen.getByText(/ha sido cancelado/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /borrar de mi perfil/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /eliminar globalmente/i })).not.toBeInTheDocument();
  });

  test("shows creator edit action", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: baseEvent });
    renderDetails();

    fireEvent.click(await screen.findByRole("button", { name: /editar/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/events/event-id/edit");
  });

  test("hides edit action for non creator events", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: { ...baseEvent, creator: "other-user" } });
    renderDetails();

    expect(await screen.findByRole("heading", { name: "Padel match" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /editar/i })).not.toBeInTheDocument();
  });

  test("shows empty participant state", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: { ...baseEvent, participantsList: [] } });
    renderDetails();

    expect(await screen.findByText(/todavia no hay participantes/i)).toBeInTheDocument();
  });

  test("renders external locations and unknown creators", async () => {
    eventsApi.getEventById.mockResolvedValue({
      event: {
        ...baseEvent,
        creator: "",
        location: "https://maps.example/event",
        locationName: "",
        participantsList: undefined,
      },
    });
    renderDetails();

    expect(await screen.findByText("Usuario desconocido")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://maps.example/event" })).toHaveAttribute("href", "https://maps.example/event");
  });

  test("renders missing location fallback and deterministic back navigation", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: { ...baseEvent, location: "", locationName: "" } });
    renderDetails();

    expect(await screen.findByText("Ubicacion no indicada")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /volver/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/events");
  });

  test("creator can cancel active events", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: baseEvent });
    eventsApi.cancelEvent.mockResolvedValue({ event: { ...baseEvent, status: "cancelled" } });
    renderDetails();

    fireEvent.click(await screen.findByRole("button", { name: /cancelar evento/i }));
    await waitFor(() => expect(eventsApi.cancelEvent).toHaveBeenCalledWith("event-id"));
    expect(await screen.findByText("Cancelled")).toBeInTheDocument();
  });

  test("shows cancel event errors", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: baseEvent });
    eventsApi.cancelEvent.mockRejectedValue(new Error("No se pudo cancelar"));
    renderDetails();

    fireEvent.click(await screen.findByRole("button", { name: /cancelar evento/i }));
    expect(await screen.findByText("No se pudo cancelar")).toBeInTheDocument();
  });

  test("shows default cancel event error when the thrown error has no message", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: baseEvent });
    eventsApi.cancelEvent.mockRejectedValue({});
    renderDetails();

    fireEvent.click(await screen.findByRole("button", { name: /cancelar evento/i }));
    expect(await screen.findByText("No se pudo cancelar el evento.")).toBeInTheDocument();
  });

  test("dismisses cancelled and past events from profile", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: { ...baseEvent, status: "past" } });
    eventsApi.dismissEvent.mockResolvedValue({ eventId: "event-id" });
    renderDetails();

    fireEvent.click(await screen.findByRole("button", { name: /borrar de mi perfil/i }));
    await waitFor(() => expect(eventsApi.dismissEvent).toHaveBeenCalledWith("event-id"));
    expect(mockNavigate).toHaveBeenCalledWith("/profile", { replace: true });
  });

  test("shows dismiss errors", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: { ...baseEvent, status: "cancelled" } });
    eventsApi.dismissEvent.mockRejectedValue(new Error("No se pudo borrar"));
    renderDetails();

    fireEvent.click(await screen.findByRole("button", { name: /borrar de mi perfil/i }));
    expect(await screen.findByText("No se pudo borrar")).toBeInTheDocument();
  });

  test("shows default dismiss fallback", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: { ...baseEvent, status: "cancelled" } });
    eventsApi.dismissEvent.mockRejectedValue({});
    renderDetails();

    fireEvent.click(await screen.findByRole("button", { name: /borrar de mi perfil/i }));
    expect(await screen.findByText("No se pudo borrar el evento de tu perfil.")).toBeInTheDocument();
  });

  test("creator can delete active events", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: baseEvent });
    eventsApi.deleteEvent.mockResolvedValue({ eventId: "event-id" });
    renderDetails();

    fireEvent.click(await screen.findByRole("button", { name: /eliminar globalmente/i }));
    await waitFor(() => expect(eventsApi.deleteEvent).toHaveBeenCalledWith("event-id"));
    expect(mockNavigate).toHaveBeenCalledWith("/profile", { replace: true });
  });

  test("shows delete errors", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: baseEvent });
    eventsApi.deleteEvent.mockRejectedValue(new Error("No se pudo eliminar"));
    renderDetails();

    fireEvent.click(await screen.findByRole("button", { name: /eliminar globalmente/i }));
    expect(await screen.findByText("No se pudo eliminar")).toBeInTheDocument();
  });

  test("shows default delete fallback", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: baseEvent });
    eventsApi.deleteEvent.mockRejectedValue({});
    renderDetails();

    fireEvent.click(await screen.findByRole("button", { name: /eliminar globalmente/i }));
    expect(await screen.findByText("No se pudo eliminar el evento.")).toBeInTheDocument();
  });

  test("past events show date edit action instead of global delete", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: { ...baseEvent, status: "past" } });
    renderDetails();

    expect(await screen.findByText("Past")).toBeInTheDocument();
    expect(screen.getByText(/ya ha pasado/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cambiar fecha/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/events/event-id/edit");
    expect(screen.queryByRole("button", { name: /eliminar globalmente/i })).not.toBeInTheDocument();
  });

  test("shows default loading error", async () => {
    eventsApi.getEventById.mockRejectedValue({});
    renderDetails();

    expect(await screen.findByText("No se pudo cargar el evento.")).toBeInTheDocument();
  });

  test("shows missing event fallback", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: null });
    renderDetails();

    expect(await screen.findByText("Evento no encontrado.")).toBeInTheDocument();
  });

  test("shows an error when route has no event id", async () => {
    render(
      <MemoryRouter initialEntries={["/events"]}>
        <Routes>
          <Route path="/events" element={<CardDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("No se ha indicado ningun evento.")).toBeInTheDocument();
    expect(eventsApi.getEventById).not.toHaveBeenCalled();
  });

  test("shows loading errors and navigates back to events", async () => {
    eventsApi.getEventById.mockRejectedValue(new Error("Evento no encontrado"));
    renderDetails();

    expect(await screen.findByText("Evento no encontrado")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /volver/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/events");
  });
});
