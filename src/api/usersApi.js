import { apiFetch } from "./client";
import { assertOkResponse } from "./response";

export async function getUser(userName) {
  const response = await apiFetch(`/api/user/${userName}`);
  return assertOkResponse(response, "No se pudo cargar el usuario");
}
