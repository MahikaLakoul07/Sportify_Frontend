const RAW_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

function buildUrl(path) {
  if (path.startsWith("http")) return path;
  return `${RAW_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

function isValidToken(token) {
  return !!token && token !== "undefined" && token !== "null" && token.split(".").length === 3;
}

function getStoredAccessToken() {
  const token = localStorage.getItem("access");
  return isValidToken(token) ? token : null;
}

function getStoredRefreshToken() {
  const token = localStorage.getItem("refresh");
  return isValidToken(token) ? token : null;
}

async function tryRefreshToken() {
  const refresh = getStoredRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(buildUrl("/api/token/refresh/"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      localStorage.removeItem("user_id");
      return null;
    }

    const data = await res.json();

    if (isValidToken(data?.access)) {
      localStorage.setItem("access", data.access);
      return data.access;
    }

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    return null;
  } catch (err) {
    console.error("Token refresh failed:", err);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    return null;
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = "Request failed.";
    try {
      const errData = await response.json();
      errorMessage = errData?.detail || JSON.stringify(errData);
    } catch {
      errorMessage = response.statusText || "Request failed.";
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;
  return await response.json();
}

export async function publicFetch(path, options = {}) {
  const url = buildUrl(path);

  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return handleResponse(response);
}

export async function apiFetch(path, options = {}, retry = true) {
  const url = buildUrl(path);
  const access = getStoredAccessToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (access) {
    headers["Authorization"] = `Bearer ${access}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry) {
    const newAccess = await tryRefreshToken();

    if (newAccess) {
      const retryHeaders = {
        ...(options.headers || {}),
      };

      if (!(options.body instanceof FormData)) {
        retryHeaders["Content-Type"] = "application/json";
      }

      retryHeaders["Authorization"] = `Bearer ${newAccess}`;

      const retryResponse = await fetch(url, {
        ...options,
        headers: retryHeaders,
      });

      return handleResponse(retryResponse);
    }

    throw new Error("Your session expired. Please log in again.");
  }

  return handleResponse(response);
}