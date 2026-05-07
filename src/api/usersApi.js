import { apiFetch } from "./client";
import { assertOkResponse } from "./response";

export async function getUser(userName) {
  const response = await apiFetch(`/api/user/${userName}`);
  return assertOkResponse(response, "No se pudo cargar el usuario");
}

export async function getCurrentUser() {
  const response = await apiFetch("/api/users/me");
  return assertOkResponse(response, "No se pudo cargar el perfil");
}

export async function updateCurrentUser(userData) {
  const response = await apiFetch("/api/users/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return assertOkResponse(response, "No se pudo actualizar el perfil");
}
