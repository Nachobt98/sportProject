export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const PUBLIC_API_PATHS = ["/api/login", "/api/register", "/api/health"];

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
  }).then((response) => {
    if (response.status === 401 && !PUBLIC_API_PATHS.includes(path)) {
      window.dispatchEvent(new Event("sportlife:unauthorized"));
    }

    return response;
  });
}

