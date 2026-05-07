import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CardDetails from "./CardDetails";
import * as eventsApi from "../api/eventsApi";

jest.mock("../api/eventsApi");
const mockNavigate = jest.fn();

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
};

function renderDetails(path = "/events/event-id") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/events/:eventId" element={<CardDetails />} />
        <Route path="/searchCard2" element={<div>Events page</div>} />
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
  });

  test("shows empty participant state", async () => {
    eventsApi.getEventById.mockResolvedValue({
      event: { ...baseEvent, participantsList: [] },
    });

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
    expect(screen.getByRole("link", { name: "https://maps.example/event" })).toHaveAttribute(
      "href",
      "https://maps.example/event"
    );
  });

  test("renders missing location fallback and back navigation", async () => {
    eventsApi.getEventById.mockResolvedValue({
      event: { ...baseEvent, location: "", locationName: "" },
    });

    renderDetails();

    expect(await screen.findByText("Ubicacion no indicada")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /volver/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
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
    expect(mockNavigate).toHaveBeenCalledWith("/searchCard2");
  });
});
