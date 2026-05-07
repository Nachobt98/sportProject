import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Perfil } from "./perfil";
import * as eventsApi from "../api/eventsApi";
import * as usersApi from "../api/usersApi";

jest.mock("../api/eventsApi");
jest.mock("../api/usersApi");
jest.mock("../components/cardEvent", () => ({
  CardEvent: ({ event, onChanged, onRemoved }) => (
    <div>
      <span>{event.name}</span>
      <button onClick={() => onChanged?.({ ...event, participantsList: ["nacho"] })}>change event</button>
      <button onClick={() => onRemoved?.(event._id)}>remove event</button>
    </div>
  ),
}));

const mockSetUsers = jest.fn();
const mockUser = {
  firstName: "Nacho",
  lastName: "Bru",
  userName: "nacho",
  email: "nacho@example.com",
  city: "Valencia",
  birthdate: "1998-10-20T00:00:00.000Z",
  profileImage: "data:image/png;base64,AAAA",
};

jest.mock("../context/userContext", () => ({
  useUser: () => ({ users: mockUser, setUsers: mockSetUsers }),
}));

function renderProfile() {
  return render(
    <MemoryRouter>
      <Perfil />
    </MemoryRouter>
  );
}

describe("Perfil", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    eventsApi.getUserCreatedEvents.mockResolvedValue([
      { _id: "created-id", name: "Created event", participantsList: [], creator: "nacho" },
    ]);
    eventsApi.getUserJoinedEvents.mockResolvedValue([
      { _id: "joined-id", name: "Joined event", participantsList: ["nacho"], creator: "other" },
    ]);
    usersApi.updateCurrentUser.mockResolvedValue({ user: { ...mockUser, city: "Madrid" } });
  });

  test("renders profile information and events", async () => {
    renderProfile();

    expect(screen.getByRole("heading", { name: /perfil/i })).toBeInTheDocument();
    expect(screen.getByText("Nacho Bru")).toBeInTheDocument();
    expect(await screen.findByText("Created event")).toBeInTheDocument();
    expect(screen.getByText("Joined event")).toBeInTheDocument();
  });

  test("shows event loading errors", async () => {
    eventsApi.getUserCreatedEvents.mockRejectedValue(new Error("No se pudieron cargar los eventos"));

    renderProfile();

    expect(await screen.findByText("No se pudieron cargar los eventos")).toBeInTheDocument();
  });

  test("persists profile changes in the backend", async () => {
    renderProfile();
    fireEvent.click(screen.getByRole("button", { name: /editar perfil/i }));
    fireEvent.change(screen.getByLabelText(/ciudad/i), { target: { name: "city", value: "Madrid" } });
    fireEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(usersApi.updateCurrentUser).toHaveBeenCalledWith(expect.objectContaining({ city: "Madrid" })));
    expect(mockSetUsers).toHaveBeenCalledWith(expect.objectContaining({ city: "Madrid" }));
    expect(await screen.findByText(/perfil actualizado correctamente/i)).toBeInTheDocument();
  });

  test("shows profile update errors", async () => {
    usersApi.updateCurrentUser.mockRejectedValue(new Error("No se pudo actualizar el perfil"));

    renderProfile();
    fireEvent.click(screen.getByRole("button", { name: /editar perfil/i }));
    fireEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(await screen.findByText("No se pudo actualizar el perfil")).toBeInTheDocument();
  });

  test("updates local event lists through panel callbacks", async () => {
    renderProfile();
    await screen.findByText("Joined event");

    fireEvent.click(screen.getAllByText("change event")[0]);
    fireEvent.click(screen.getAllByText("remove event")[0]);

    expect(screen.queryByText("Created event")).not.toBeInTheDocument();
  });
});
