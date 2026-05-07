export async function parseApiResponse(response) {
  try {
    return await response.json();
  } catch {
    return { message: response.statusText };
  }
}

export async function assertOkResponse(response, fallbackMessage) {
  const data = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}
