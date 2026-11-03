const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;

  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    const message =
      data?.detail || `Error HTTP ${response.status}`;

    throw new Error(
      typeof message === "string"
        ? message
        : JSON.stringify(message),
    );
  }

  return data;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
