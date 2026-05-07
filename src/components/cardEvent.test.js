import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CardEvent } from "./cardEvent";
import * as eventsApi from "../api/eventsApi";

jest.mock("../api/eventsApi");
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../context/userContext", () => ({
  useUser: () => ({ users: { userName: "nacho" } }),
}));

const baseEvent = {
  _id: "event-id",
  name: "Padel match",
  description: "Friendly match",
  sport: "Padel",
  date: "2026-01-01T00:00:00.000Z",
  city: "Valencia",
  creator: "other",
  participants: 4,
  participantsList: [],
};

function renderCard(event = baseEvent, props = {}) {
  return render(
    <MemoryRouter>
      <CardEvent event={event} {...props} />
    </MemoryRouter>
  );
}

describe("CardEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders event information", () => {
    renderCard();

    expect(screen.getByText("Padel match")).toBeInTheDocument();
    expect(screen.getByText("Friendly match")).toBeInTheDocument();
    expect(screen.getByText("Padel")).toBeInTheDocument();
  });

  test("navigates to event detail route", () => {
    renderCard();

    fireEvent.click(screen.getByRole("button", { name: /detalle/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/events/event-id");
  });

  test("joins an event", async () => {
    const onChanged = jest.fn();
    eventsApi.joinEvent.mockResolvedValue({
      event: { ...baseEvent, participantsList: ["nacho"] },
    });

    renderCard(baseEvent, { onChanged });
    fireEvent.click(screen.getByRole("button", { name: /unirse/i }));

    await waitFor(() => expect(eventsApi.joinEvent).toHaveBeenCalledWith("event-id"));
    expect(onChanged).toHaveBeenCalledWith(expect.objectContaining({ participantsList: ["nacho"] }));
  });

  test("cancels event participation", async () => {
    const onChanged = jest.fn();
    const joinedEvent = { ...baseEvent, participantsList: ["nacho"] };
    eventsApi.cancelEventJoin.mockResolvedValue({ event: { ...baseEvent, participantsList: [] } });

    renderCard(joinedEvent, { onChanged });
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    await waitFor(() => expect(eventsApi.cancelEventJoin).toHaveBeenCalledWith("event-id"));
    expect(onChanged).toHaveBeenCalled();
  });

  test("deletes own events", async () => {
    const onRemoved = jest.fn();
    eventsApi.deleteEvent.mockResolvedValue({ eventId: "event-id" });

    renderCard({ ...baseEvent, creator: "nacho" }, { onRemoved });
    fireEvent.click(screen.getByRole("button", { name: /eliminar/i }));

    await waitFor(() => expect(eventsApi.deleteEvent).toHaveBeenCalledWith("event-id"));
    expect(onRemoved).toHaveBeenCalledWith("event-id");
  });
});
