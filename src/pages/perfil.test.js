import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Perfil } from "./perfil";
import * as eventsApi from "../api/eventsApi";
import * as usersApi from "../api/usersApi";
import { renderWithQueryClient } from "../testUtils/renderWithQueryClient";

jest.mock("../api/eventsApi");
jest.mock("../api/usersApi");
jest.mock("../components/cardEvent", () => ({
  CardEvent: ({ event, onChanged, onRemoved }) => (
    <div>
      <span>{event.name}</span>
      <button onClick={() => onChanged?.({ ...event, participantsList: ["nacho"] })}>change event</button>
      <button onClick={() => onChanged?.({ ...event, participantsList: [] })}>leave event</button>
      <button onClick={() => onRemoved?.(event._id)}>remove event</button>
    </div>
  ),
}));

const mockSetUsers = jest.fn();
const defaultMockUser = {
  firstName: "Nacho",
  lastName: "Bru",
  userName: "nacho",
  email: "nacho@example.com",
  city: "Valencia",
  birthdate: "1998-10-20T00:00:00.000Z",
  profileImage: "/uploads/profile-images/nacho.png",
};
let mockUser = { ...defaultMockUser };

jest.mock("../context/userContext", () => ({
  useUser: () => ({ users: mockUser, setUsers: mockSetUsers }),
}));

function renderProfile() {
  return renderWithQueryClient(
    <MemoryRouter>
      <Perfil />
    </MemoryRouter>
  );
}

async function waitForProfileEvents() {
  await screen.findByText("Created event");
  await screen.findByText("Joined event");
}

describe("Perfil", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { ...defaultMockUser };
    eventsApi.getCurrentUserCreatedEvents.mockResolvedValue([
      { _id: "created-id", name: "Created event", participantsList: [], creator: "nacho" },
    ]);
    eventsApi.getCurrentUserJoinedEvents.mockResolvedValue([
      { _id: "joined-id", name: "Joined event", participantsList: ["nacho"], creator: "other" },
    ]);
    usersApi.updateCurrentUser.mockResolvedValue({ user: { ...mockUser, city: "Madrid" } });
    usersApi.uploadProfileImage.mockResolvedValue({ user: { ...mockUser, profileImage: "/uploads/profile-images/new-avatar.png" } });
  });

  test("renders profile information and events", async () => {
    renderProfile();

    expect(screen.getByRole("heading", { name: /perfil/i })).toBeInTheDocument();
    expect(screen.getByText("Nacho Bru")).toBeInTheDocument();
    await waitForProfileEvents();
  });

  test("renders fallback profile values when user data is incomplete", async () => {
    mockUser = { userName: "", birthdate: "invalid-date", profileImage: "" };

    renderProfile();

    expect(screen.getAllByText("Usuario").length).toBeGreaterThan(0);
    expect(screen.getByText("Email sin completar")).toBeInTheDocument();
    expect(screen.getAllByText("Sin completar").length).toBeGreaterThan(0);
    expect(eventsApi.getCurrentUserCreatedEvents).not.toHaveBeenCalled();
    expect(eventsApi.getCurrentUserJoinedEvents).not.toHaveBeenCalled();
  });

  test("shows event loading errors", async () => {
    eventsApi.getCurrentUserCreatedEvents.mockRejectedValue(new Error("No se pudieron cargar los eventos"));

    renderProfile();

    expect(await screen.findByText("No se pudieron cargar los eventos")).toBeInTheDocument();
  });

  test("persists profile changes in the backend without sending profile image payload", async () => {
    renderProfile();
    await waitForProfileEvents();

    fireEvent.click(screen.getByRole("button", { name: /editar perfil/i }));
    fireEvent.change(screen.getByLabelText(/ciudad/i), { target: { name: "city", value: "Madrid" } });
    fireEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => expect(usersApi.updateCurrentUser).toHaveBeenCalledWith(expect.objectContaining({ city: "Madrid" })));
    expect(usersApi.updateCurrentUser).toHaveBeenCalledWith(expect.not.objectContaining({ profileImage: expect.anything() }));
    expect(mockSetUsers).toHaveBeenCalledWith(expect.objectContaining({ city: "Madrid" }));
    expect(await screen.findByText(/perfil actualizado correctamente/i)).toBeInTheDocument();
  });

  test("uploads profile image immediately after selecting a valid file", async () => {
    const { container } = renderProfile();
    await waitForProfileEvents();

    const input = container.querySelector('input[type="file"]');
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(usersApi.uploadProfileImage).toHaveBeenCalledWith(file));
    expect(usersApi.updateCurrentUser).not.toHaveBeenCalled();
    expect(mockSetUsers).toHaveBeenCalledWith(expect.objectContaining({ profileImage: "/uploads/profile-images/new-avatar.png" }));
    expect(await screen.findByText(/foto de perfil actualizada correctamente/i)).toBeInTheDocument();
  });

  test("ignores empty profile image selections", async () => {
    const { container } = renderProfile();
    await waitForProfileEvents();

    const input = container.querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [] } });

    expect(usersApi.uploadProfileImage).not.toHaveBeenCalled();
  });

  test("rejects invalid profile image types", async () => {
    const { container } = renderProfile();
    await waitForProfileEvents();

    const input = container.querySelector('input[type="file"]');
    const file = new File(["avatar"], "avatar.gif", { type: "image/gif" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/la imagen debe ser jpg, png o webp/i)).toBeInTheDocument();
    expect(usersApi.uploadProfileImage).not.toHaveBeenCalled();
  });

  test("rejects profile images that are too large", async () => {
    const { container } = renderProfile();
    await waitForProfileEvents();

    const input = container.querySelector('input[type="file"]');
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 2 * 1024 * 1024 });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/menos de 1.5 mb/i)).toBeInTheDocument();
    expect(usersApi.uploadProfileImage).not.toHaveBeenCalled();
  });

  test("shows profile image upload errors", async () => {
    usersApi.uploadProfileImage.mockRejectedValue(new Error("No se pudo actualizar la imagen"));

    const { container } = renderProfile();
    await waitForProfileEvents();

    const input = container.querySelector('input[type="file"]');
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText("No se pudo actualizar la imagen")).toBeInTheDocument();
  });

  test("shows profile update errors", async () => {
    usersApi.updateCurrentUser.mockRejectedValue(new Error("No se pudo actualizar el perfil"));

    renderProfile();
    await waitForProfileEvents();

    fireEvent.click(screen.getByRole("button", { name: /editar perfil/i }));
    fireEvent.click(screen.getByRole("button", { name: /guardar/i }));

    expect(await screen.findByText("No se pudo actualizar el perfil")).toBeInTheDocument();
  });

  test("updates local event lists through panel callbacks", async () => {
    renderProfile();
    await waitForProfileEvents();

    fireEvent.click(screen.getAllByText("change event")[0]);
    fireEvent.click(screen.getAllByText("remove event")[0]);

    expect(screen.queryByText("Created event")).not.toBeInTheDocument();
  });

  test("removes joined events when the updated participants no longer include the user", async () => {
    renderProfile();
    await waitForProfileEvents();

    fireEvent.click(screen.getAllByText("leave event")[1]);

    expect(screen.queryByText("Joined event")).not.toBeInTheDocument();
  });
});
