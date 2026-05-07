import { apiFetch } from "./client";
import { assertOkResponse } from "./response";

export async function getEvents() {
  const response = await apiFetch("/api/events");
  return assertOkResponse(response, "No se pudieron cargar los eventos");
}

export async function getEventById(eventId) {
  const response = await apiFetch(`/api/events/${eventId}`);
  return assertOkResponse(response, "No se pudo cargar el evento");
}

export async function createEvent(eventData) {
  const response = await apiFetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
  });

  return assertOkResponse(response, "No se pudo crear el evento");
}

export async function deleteEvent(eventId) {
  const response = await apiFetch(`/api/events/${eventId}`, {
    method: "DELETE",
  });

  return assertOkResponse(response, "No se pudo eliminar el evento");
}

export async function joinEvent(eventId) {
  const response = await apiFetch(`/api/events/${eventId}/join`, {
    method: "POST",
  });

  return assertOkResponse(response, "No se pudo unir al evento");
}

export async function cancelEventJoin(eventId) {
  const response = await apiFetch(`/api/events/${eventId}/join`, {
    method: "DELETE",
  });

  return assertOkResponse(response, "No se pudo cancelar la participacion");
}

export async function getCurrentUserCreatedEvents() {
  const response = await apiFetch("/api/users/me/events");
  return assertOkResponse(response, "No se pudieron cargar los eventos creados");
}

export async function getCurrentUserJoinedEvents() {
  const response = await apiFetch("/api/users/me/joined-events");
  return assertOkResponse(response, "No se pudieron cargar los eventos unidos");
}
