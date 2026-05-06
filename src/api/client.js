const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export function apiFetch(path, options) {
  return fetch(`${API_BASE_URL}${path}`, options);
}

