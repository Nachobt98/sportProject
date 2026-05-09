import React from "react";
import { act, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CreateEvent } from "./CreateEvent";
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
  location: "Court 1",
  locationName: "Club Valencia",
  creator: "nacho",
  participants: 4,
};

function renderCreateEvent(path = "/events/new") {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/events/new" element={<CreateEvent />} />
        <Route path="/events/:eventId/edit" element={<CreateEvent />} />
      </Routes>
    </MemoryRouter>
  );
}

function fillField(container, name, value) {
  fireEvent.change(container.querySelector(`[name="${name}"]`), {
    target: { name, value },
  });
}

function selectParticipants(value) {
  fireEvent.mouseDown(screen.getByLabelText(/numero de participantes/i));
  fireEvent.click(screen.getByRole("option", { name: String(value) }));
}

describe("CreateEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("renders create event form", () => {
    renderCreateEvent();

    expect(screen.getByRole("heading", { name: /crear evento/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear evento/i })).toBeInTheDocument();
  });

  test("creates an event successfully", async () => {
    jest.useFakeTimers();
    eventsApi.createEvent.mockResolvedValue({ event: { _id: "event-id" } });

    const { container } = renderCreateEvent();
    fillField(container, "name", "Padel match");
    fillField(container, "sport", "Padel");
    fillField(container, "description", "Friendly match");
    fillField(container, "city", "Valencia");
    fillField(container, "date", "2026-01-01");
    fillField(container, "location", "Court 1");
    fillField(container, "locationName", "Club Valencia");
    selectParticipants(4);

    fireEvent.click(screen.getByRole("button", { name: /crear evento/i }));

    await waitFor(() => expect(eventsApi.createEvent).toHaveBeenCalledWith(expect.objectContaining({
      name: "Padel match",
      participants: 4,
      creator: "nacho",
    })));
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(mockNavigate).toHaveBeenCalledWith("/events");
    jest.useRealTimers();
  });

  test("loads and updates an existing event", async () => {
    jest.useFakeTimers();
    eventsApi.getEventById.mockResolvedValue({ event: baseEvent });
    eventsApi.updateEvent.mockResolvedValue({ event: { ...baseEvent, name: "Updated match" } });

    const { container } = renderCreateEvent("/events/event-id/edit");

    const nameInput = await screen.findByDisplayValue("Padel match");
    expect(screen.getByRole("heading", { name: /editar evento/i })).toBeInTheDocument();
    expect(nameInput).toHaveAttribute("name", "name");
    expect(screen.getAllByRole("button", { name: /volver/i })).toHaveLength(1);

    fillField(container, "name", "Updated match");
    fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => expect(eventsApi.updateEvent).toHaveBeenCalledWith("event-id", expect.objectContaining({
      name: "Updated match",
      participants: 4,
      creator: "nacho",
    })));
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(mockNavigate).toHaveBeenCalledWith("/events/event-id", { replace: true });
    jest.useRealTimers();
  });

  test("navigates back to event detail from edit mode", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: baseEvent });

    renderCreateEvent("/events/event-id/edit");

    await screen.findByDisplayValue("Padel match");
    fireEvent.click(screen.getByRole("button", { name: /volver/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/events/event-id", { replace: true });
  });

  test("blocks editing when the current user is not the creator", async () => {
    eventsApi.getEventById.mockResolvedValue({ event: { ...baseEvent, creator: "other-user" } });

    renderCreateEvent("/events/event-id/edit");

    expect(await screen.findByText("Solo el creador puede editar este evento.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /guardar cambios/i })).not.toBeInTheDocument();
  });

  test("shows loading errors in edit mode", async () => {
    eventsApi.getEventById.mockRejectedValue(new Error("Evento no encontrado"));

    renderCreateEvent("/events/event-id/edit");

    expect(await screen.findByText("Evento no encontrado")).toBeInTheDocument();
  });

  test("shows validation errors for empty form", async () => {
    renderCreateEvent();

    fireEvent.click(screen.getByRole("button", { name: /crear evento/i }));

    expect(await screen.findByText(/nombre es requerido/i)).toBeInTheDocument();
  });
});
