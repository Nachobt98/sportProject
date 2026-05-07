import { apiFetch } from "./client";
import { assertOkResponse } from "./response";

export async function loginUser(credentials) {
  const response = await apiFetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  return assertOkResponse(response, "Credenciales no validas");
}

export async function registerUser(userData) {
  const response = await apiFetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return assertOkResponse(response, "No se pudo completar el registro.");
}

export async function getCurrentSession() {
  const response = await apiFetch("/api/session");
  return assertOkResponse(response, "No se pudo validar la sesion");
}
