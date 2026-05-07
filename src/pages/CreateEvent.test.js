import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CreateEvent } from "./CreateEvent";
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

function renderCreateEvent() {
  return render(
    <MemoryRouter>
      <CreateEvent />
    </MemoryRouter>
  );
}

function fillField(container, name, value) {
  fireEvent.change(container.querySelector(`[name="${name}"]`), {
    target: { name, value },
  });
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
    fillField(container, "participants", "4");

    fireEvent.click(screen.getByRole("button", { name: /crear evento/i }));

    await waitFor(() => expect(eventsApi.createEvent).toHaveBeenCalledWith(expect.objectContaining({
      name: "Padel match",
      participants: 4,
      creator: "nacho",
    })));
    jest.runOnlyPendingTimers();
    expect(mockNavigate).toHaveBeenCalledWith("/searchCard2");
    jest.useRealTimers();
  });

  test("shows validation errors for empty form", async () => {
    renderCreateEvent();

    fireEvent.click(screen.getByRole("button", { name: /crear evento/i }));

    expect(await screen.findByText(/nombre es requerido/i)).toBeInTheDocument();
  });
});
