import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Calendar } from "./calendar";
import { apiFetch } from "../api/client";

jest.mock("../api/client");
jest.mock("../components/cardEvent", () => ({
  CardEvent: ({ event, onChanged, onRemoved }) => (
    <div>
      <span>{event.name}</span>
      <button onClick={() => onChanged?.({ ...event, participantsList: ["nacho"] })}>
        change {event._id}
      </button>
      <button onClick={() => onChanged?.({ ...event, participantsList: [] })}>
        leave {event._id}
      </button>
      <button onClick={() => onRemoved?.(event._id)}>remove {event._id}</button>
    </div>
  ),
}));
jest.mock("@mui/x-date-pickers/LocalizationProvider", () => ({
  LocalizationProvider: ({ children }) => <div>{children}</div>,
}));
jest.mock("@mui/x-date-pickers/DateCalendar", () => ({
  DateCalendar: ({ onChange }) => (
    <button onClick={() => onChange(null)}>calendar control</button>
  ),
}));

let mockUserName = "nacho";
jest.mock("../context/userContext", () => ({
  useUser: () => ({ users: { userName: mockUserName } }),
}));

const events = [
  {
    _id: "event-id",
    name: "Today event",
    date: new Date().toISOString(),
    participantsList: [],
  },
  {
    _id: "future-id",
    name: "Future event",
    date: "2099-01-01T00:00:00.000Z",
    participantsList: ["nacho"],
  },
];

function jsonResponse(data, ok = true) {
  return { ok, json: jest.fn().mockResolvedValue(data) };
}

describe("Calendar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserName = "nacho";
    apiFetch
      .mockResolvedValueOnce(jsonResponse(events))
      .mockResolvedValueOnce(jsonResponse([events[1]]));
  });

  test("loads events and switches tabs", async () => {
    render(<Calendar />);

    await waitFor(() => expect(screen.getAllByText("Today event").length).toBeGreaterThan(0));
    expect(screen.getAllByText("Future event").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("tab", { name: /mis eventos/i }));
    expect(screen.getByText("Future event")).toBeInTheDocument();
  });

  test("updates and removes events from local lists", async () => {
    render(<Calendar />);
    await waitFor(() => expect(screen.getAllByText("Today event").length).toBeGreaterThan(0));

    fireEvent.click(screen.getAllByText("change event-id")[0]);
    fireEvent.click(screen.getAllByText("leave future-id")[0]);
    fireEvent.click(screen.getAllByText("remove event-id")[0]);

    await waitFor(() => expect(screen.queryByText("Today event")).not.toBeInTheDocument());
  });

  test("handles empty and failing event loads", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    apiFetch.mockReset();
    apiFetch
      .mockResolvedValueOnce(jsonResponse([]))
      .mockRejectedValueOnce(new Error("joined failed"));

    render(<Calendar />);

    expect(await screen.findByText("No hay eventos para este dia.")).toBeInTheDocument();
    expect(screen.getByText("No hay eventos proximos desde esta fecha.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /mis eventos/i }));
    expect(screen.getByText("Todavia no te has unido a eventos proximos.")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error al obtener los eventos unidos del usuario:",
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });

  test("handles event list failures", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    apiFetch.mockReset();
    apiFetch
      .mockRejectedValueOnce(new Error("events failed"))
      .mockResolvedValueOnce(jsonResponse([]));

    render(<Calendar />);

    expect(await screen.findByText("No hay eventos para este dia.")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching events:", expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  test("uses an empty joined list when no user is loaded", async () => {
    mockUserName = "";
    apiFetch.mockReset();
    apiFetch.mockResolvedValueOnce(jsonResponse([]));

    render(<Calendar />);

    expect(await screen.findByText("No hay eventos para este dia.")).toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });
});
