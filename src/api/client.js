const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export function apiFetch(path, options) {
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  const headers = {
    ...(options?.headers || {}),
  };

  if (auth.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
}

