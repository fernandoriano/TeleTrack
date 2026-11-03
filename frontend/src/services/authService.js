import { apiRequest } from "./api";


export async function login(
  username,
  password
) {
  const data = await apiRequest(
    "/api/v1/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        username,
        password
      })
    }
  );

  localStorage.setItem(
    "access_token",
    data.access_token
  );

  if (data.refresh_token) {
    localStorage.setItem(
      "refresh_token",
      data.refresh_token
    );
  }

  return data;
}


export async function refreshSession() {
  const refreshToken =
    localStorage.getItem(
      "refresh_token"
    );

  if (!refreshToken) {
    throw new Error(
      "No refresh token available."
    );
  }

  const data = await apiRequest(
    "/api/v1/auth/refresh",
    {
      method: "POST",
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    }
  );

  localStorage.setItem(
    "access_token",
    data.access_token
  );

  if (data.refresh_token) {
    localStorage.setItem(
      "refresh_token",
      data.refresh_token
    );
  }

  return data;
}


export async function logout() {
  const refreshToken =
    localStorage.getItem(
      "refresh_token"
    );

  try {
    if (refreshToken) {
      await apiRequest(
        "/api/v1/auth/logout",
        {
          method: "POST",
          body: JSON.stringify({
            refresh_token: refreshToken
          })
        }
      );
    }
  } finally {
    clearSession();
  }
}


export function clearSession() {
  localStorage.removeItem(
    "access_token"
  );

  localStorage.removeItem(
    "refresh_token"
  );
}


export function getAccessToken() {
  return localStorage.getItem(
    "access_token"
  );
}


export function getRefreshToken() {
  return localStorage.getItem(
    "refresh_token"
  );
}


export function isAuthenticated() {
  return Boolean(
    getAccessToken()
  );
}
