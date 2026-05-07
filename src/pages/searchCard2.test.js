import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SearchCard2 } from "./searchCard2";
import * as eventsApi from "../api/eventsApi";

jest.mock("../api/eventsApi");
jest.mock("../components/cardEvent", () => ({
  CardEvent: ({ event, onChanged, onRemoved }) => (
    <div>
      <span>{event.name}</span>
      <button onClick={() => onChanged?.({ ...event, name: `${event.name} updated` })}>
        change {event._id}
      </button>
      <button onClick={() => onRemoved?.(event._id)}>remove {event._id}</button>
    </div>
  ),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const events = [
  {
    _id: "1",
    name: "Padel Valencia",
    city: "Valencia",
    sport: "Padel",
    date: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "2",
    name: "Futbol Madrid",
    city: "Madrid",
    sport: "Futbol",
    date: "2026-01-02T00:00:00.000Z",
  },
];

function renderSearch() {
  return render(
    <MemoryRouter>
      <SearchCard2 />
    </MemoryRouter>
  );
}

describe("SearchCard2", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loads and renders events", async () => {
    eventsApi.getEvents.mockResolvedValue(events);

    renderSearch();

    expect(screen.getByText(/cargando eventos/i)).toBeInTheDocument();
    expect(await screen.findByText("Padel Valencia")).toBeInTheDocument();
    expect(screen.getByText("Futbol Madrid")).toBeInTheDocument();
  });

  test("shows loading errors", async () => {
    eventsApi.getEvents.mockRejectedValue(new Error("No se pudieron cargar los eventos"));

    renderSearch();

    expect(await screen.findByText("No se pudieron cargar los eventos")).toBeInTheDocument();
  });

  test("shows an empty state when there are no events", async () => {
    eventsApi.getEvents.mockResolvedValue([]);

    renderSearch();

    expect(await screen.findByText(/no se encontraron eventos/i)).toBeInTheDocument();
  });

  test("navigates to create event", async () => {
    eventsApi.getEvents.mockResolvedValue([]);

    renderSearch();
    fireEvent.click(screen.getByRole("button", { name: /crear evento/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/events/new");
  });

  test("clears filters", async () => {
    eventsApi.getEvents.mockResolvedValue(events);

    renderSearch();
    await waitFor(() => expect(screen.getByText("Padel Valencia")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /limpiar/i }));

    expect(screen.getByText("Padel Valencia")).toBeInTheDocument();
  });

  test("filters, updates and removes events", async () => {
    eventsApi.getEvents.mockResolvedValue(events);

    renderSearch();
    await waitFor(() => expect(screen.getByText("Padel Valencia")).toBeInTheDocument());

    fireEvent.mouseDown(screen.getByLabelText(/ciudad/i));
    fireEvent.click(screen.getByRole("option", { name: "Valencia" }));
    expect(screen.queryByText("Futbol Madrid")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("change 1"));
    expect(screen.getByText("Padel Valencia updated")).toBeInTheDocument();

    fireEvent.click(screen.getByText("remove 1"));
    expect(screen.queryByText("Padel Valencia updated")).not.toBeInTheDocument();
  });
});
