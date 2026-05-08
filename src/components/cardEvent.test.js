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
  status: "open",
  canJoin: true,
};

function renderCard(event = baseEvent, props = {}) {
  return render(
    <MemoryRouter>
      <CardEvent event={event} {...props} />
    </MemoryRouter>
  );
}

async function confirmAction(nameMatcher) {
  fireEvent.click(await screen.findByRole("button", { name: nameMatcher }));
}

describe("CardEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders event information and status", () => {
    renderCard();

    expect(screen.getByText("Padel match")).toBeInTheDocument();
    expect(screen.getByText("Friendly match")).toBeInTheDocument();
    expect(screen.getByText("Padel")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  test("navigates to event detail route", () => {
    renderCard();

    fireEvent.click(screen.getByRole("button", { name: /detalle/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/events/event-id");
  });

  test("joins an event without confirmation", async () => {
    const onChanged = jest.fn();
    eventsApi.joinEvent.mockResolvedValue({
      event: { ...baseEvent, participantsList: ["nacho"] },
    });

    renderCard(baseEvent, { onChanged });
    fireEvent.click(screen.getByRole("button", { name: /unirse/i }));

    await waitFor(() => expect(eventsApi.joinEvent).toHaveBeenCalledWith("event-id"));
    expect(onChanged).toHaveBeenCalledWith(expect.objectContaining({ participantsList: ["nacho"] }));
  });

  test("shows join errors and disables full events", async () => {
    eventsApi.joinEvent.mockRejectedValue(new Error("No quedan plazas"));

    renderCard({ ...baseEvent, participants: 0 });

    const joinButton = screen.getByRole("button", { name: /unirse/i });
    expect(joinButton).toBeDisabled();

    renderCard(baseEvent);
    fireEvent.click(screen.getAllByRole("button", { name: /unirse/i })[1]);

    expect(await screen.findByText("No quedan plazas")).toBeInTheDocument();
  });

  test("cancels event participation for joined full events after confirmation", async () => {
    const onChanged = jest.fn();
    eventsApi.cancelEventJoin.mockResolvedValue({ event: { ...baseEvent, participantsList: [] } });

    renderCard({ ...baseEvent, status: "full", participants: 1, participantsList: ["nacho"] }, { onChanged });
    fireEvent.click(screen.getByRole("button", { name: /cancelar participacion/i }));

    expect(screen.getByText("Dejaras de aparecer como participante de este evento. Si quedan plazas, otra persona podra ocupar tu sitio.")).toBeInTheDocument();
    await confirmAction(/^cancelar participacion$/i);

    await waitFor(() => expect(eventsApi.cancelEventJoin).toHaveBeenCalledWith("event-id"));
    expect(onChanged).toHaveBeenCalled();
  });

  test("cancels event participation for joined past events after confirmation", async () => {
    eventsApi.cancelEventJoin.mockResolvedValue({ event: { ...baseEvent, status: "past", participantsList: [] } });

    renderCard({ ...baseEvent, status: "past", participantsList: ["nacho"] });
    fireEvent.click(screen.getByRole("button", { name: /cancelar participacion/i }));
    await confirmAction(/^cancelar participacion$/i);

    await waitFor(() => expect(eventsApi.cancelEventJoin).toHaveBeenCalledWith("event-id"));
  });

  test("disables participation cancellation for cancelled events", () => {
    renderCard({ ...baseEvent, status: "cancelled", participantsList: ["nacho"] });

    expect(screen.getByRole("button", { name: /cancelar participacion/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /borrar de mi perfil/i })).toBeEnabled();
  });

  test("shows cancel participation errors after confirmation", async () => {
    const joinedEvent = { ...baseEvent, participantsList: ["nacho"] };
    eventsApi.cancelEventJoin.mockRejectedValue(new Error("No se pudo cancelar"));

    renderCard(joinedEvent);
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    await confirmAction(/^cancelar participacion$/i);

    expect(await screen.findByText("No se pudo cancelar")).toBeInTheDocument();
  });

  test("creator can cancel active events after confirmation", async () => {
    const onChanged = jest.fn();
    eventsApi.cancelEvent.mockResolvedValue({ event: { ...baseEvent, creator: "nacho", status: "cancelled" } });

    renderCard({ ...baseEvent, creator: "nacho" }, { onChanged });
    fireEvent.click(screen.getByRole("button", { name: /cancelar evento/i }));
    await confirmAction(/^cancelar evento$/i);

    await waitFor(() => expect(eventsApi.cancelEvent).toHaveBeenCalledWith("event-id"));
    expect(onChanged).toHaveBeenCalledWith(expect.objectContaining({ status: "cancelled" }));
  });

  test("shows creator cancel errors after confirmation", async () => {
    eventsApi.cancelEvent.mockRejectedValue(new Error("No se pudo cancelar el evento"));

    renderCard({ ...baseEvent, creator: "nacho" });
    fireEvent.click(screen.getByRole("button", { name: /cancelar evento/i }));
    await confirmAction(/^cancelar evento$/i);

    expect(await screen.findByText("No se pudo cancelar el evento")).toBeInTheDocument();
  });

  test("creator can edit past event date", () => {
    renderCard({ ...baseEvent, creator: "nacho", status: "past" });

    fireEvent.click(screen.getByRole("button", { name: /cambiar fecha/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/events/event-id/edit");
  });

  test("dismisses cancelled and past events from profile after confirmation", async () => {
    const onRemoved = jest.fn();
    eventsApi.dismissEvent.mockResolvedValue({ eventId: "event-id" });

    renderCard({ ...baseEvent, status: "past" }, { onRemoved });
    fireEvent.click(screen.getByRole("button", { name: /borrar de mi perfil/i }));
    await confirmAction(/^borrar de mi perfil$/i);

    await waitFor(() => expect(eventsApi.dismissEvent).toHaveBeenCalledWith("event-id"));
    expect(onRemoved).toHaveBeenCalledWith("event-id");
  });

  test("shows dismiss errors after confirmation", async () => {
    eventsApi.dismissEvent.mockRejectedValue(new Error("No se pudo borrar"));

    renderCard({ ...baseEvent, status: "cancelled" });
    fireEvent.click(screen.getByRole("button", { name: /borrar de mi perfil/i }));
    await confirmAction(/^borrar de mi perfil$/i);

    expect(await screen.findByText("No se pudo borrar")).toBeInTheDocument();
  });

  test("deletes own active events after confirmation", async () => {
    const onRemoved = jest.fn();
    eventsApi.deleteEvent.mockResolvedValue({ eventId: "event-id" });

    renderCard({ ...baseEvent, creator: "nacho" }, { onRemoved });
    fireEvent.click(screen.getByRole("button", { name: /eliminar/i }));
    await confirmAction(/^eliminar globalmente$/i);

    await waitFor(() => expect(eventsApi.deleteEvent).toHaveBeenCalledWith("event-id"));
    expect(onRemoved).toHaveBeenCalledWith("event-id");
  });

  test("shows delete errors after confirmation", async () => {
    eventsApi.deleteEvent.mockRejectedValue(new Error("No se pudo eliminar"));

    renderCard({ ...baseEvent, creator: "nacho" });
    fireEvent.click(screen.getByRole("button", { name: /eliminar/i }));
    await confirmAction(/^eliminar globalmente$/i);

    expect(await screen.findByText("No se pudo eliminar")).toBeInTheDocument();
  });
});
