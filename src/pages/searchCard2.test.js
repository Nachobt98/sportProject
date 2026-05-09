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

function paginatedResponse(items = events, overrides = {}) {
  return {
    events: items,
    pagination: {
      page: 1,
      limit: 10,
      total: items.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      ...overrides,
    },
  };
}

function renderSearch() {
  return render(
    <MemoryRouter>
      <SearchCard2 />
    </MemoryRouter>
  );
}

async function waitForInitialSearchLoad() {
  await waitFor(() => expect(eventsApi.getEvents).toHaveBeenCalled());
}

describe("SearchCard2", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loads and renders events", async () => {
    eventsApi.getEvents.mockResolvedValue(paginatedResponse(events));

    renderSearch();

    expect(screen.getByText(/cargando eventos/i)).toBeInTheDocument();
    expect(await screen.findByText("Padel Valencia")).toBeInTheDocument();
    expect(screen.getByText("Futbol Madrid")).toBeInTheDocument();
    expect(eventsApi.getEvents).toHaveBeenCalledWith({ city: "", sport: "", date: "", page: 1, limit: 10 });
  });

  test("shows loading errors", async () => {
    eventsApi.getEvents.mockRejectedValue(new Error("No se pudieron cargar los eventos"));

    renderSearch();

    expect(await screen.findByRole("heading", { name: "No se pudieron cargar los eventos" })).toBeInTheDocument();
    expect(screen.getByText("No se pudieron cargar los eventos", { selector: "p" })).toBeInTheDocument();
  });

  test("shows an empty state when there are no events", async () => {
    eventsApi.getEvents.mockResolvedValue(paginatedResponse([]));

    renderSearch();

    expect(await screen.findByText(/no hay eventos disponibles/i)).toBeInTheDocument();
    expect(screen.getByText(/prueba a limpiar filtros/i)).toBeInTheDocument();
  });

  test("navigates to create event", async () => {
    eventsApi.getEvents.mockResolvedValue(paginatedResponse([]));

    renderSearch();
    await screen.findByText(/no hay eventos disponibles/i);
    fireEvent.click(screen.getByRole("button", { name: /crear evento/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/events/new");
  });

  test("clears filters and fetches the unfiltered event list", async () => {
    eventsApi.getEvents.mockResolvedValue(paginatedResponse(events));

    renderSearch();
    await waitForInitialSearchLoad();

    fireEvent.mouseDown(screen.getByLabelText(/ciudad/i));
    fireEvent.click(screen.getByRole("option", { name: "Valencia" }));
    await waitFor(() =>
      expect(eventsApi.getEvents).toHaveBeenLastCalledWith({ city: "Valencia", sport: "", date: "", page: 1, limit: 10 })
    );

    fireEvent.click(screen.getByRole("button", { name: /limpiar/i }));
    await waitFor(() =>
      expect(eventsApi.getEvents).toHaveBeenLastCalledWith({ city: "", sport: "", date: "", page: 1, limit: 10 })
    );
  });

  test("fetches filtered events from the backend", async () => {
    eventsApi.getEvents.mockResolvedValue(paginatedResponse(events));

    renderSearch();
    await waitFor(() => expect(screen.getByText("Padel Valencia")).toBeInTheDocument());

    fireEvent.mouseDown(screen.getByLabelText(/ciudad/i));
    fireEvent.click(screen.getByRole("option", { name: "Valencia" }));

    await waitFor(() =>
      expect(eventsApi.getEvents).toHaveBeenLastCalledWith({ city: "Valencia", sport: "", date: "", page: 1, limit: 10 })
    );
  });

  test("loads the next event page", async () => {
    eventsApi.getEvents
      .mockResolvedValueOnce(paginatedResponse([events[0]], { total: 2, totalPages: 2, hasNextPage: true }))
      .mockResolvedValueOnce(paginatedResponse([events[1]], { page: 2, total: 2, totalPages: 2, hasNextPage: false, hasPreviousPage: true }));

    renderSearch();
    expect(await screen.findByText("Padel Valencia")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cargar mas/i }));

    await waitFor(() =>
      expect(eventsApi.getEvents).toHaveBeenLastCalledWith({ city: "", sport: "", date: "", page: 2, limit: 10 })
    );
    expect(await screen.findByText("Futbol Madrid")).toBeInTheDocument();
  });

  test("updates and removes events from the current list", async () => {
    eventsApi.getEvents.mockResolvedValue(paginatedResponse(events));

    renderSearch();
    await waitFor(() => expect(screen.getByText("Padel Valencia")).toBeInTheDocument());

    fireEvent.click(screen.getByText("change 1"));
    expect(screen.getByText("Padel Valencia updated")).toBeInTheDocument();

    fireEvent.click(screen.getByText("remove 1"));
    expect(screen.queryByText("Padel Valencia updated")).not.toBeInTheDocument();
  });
});
