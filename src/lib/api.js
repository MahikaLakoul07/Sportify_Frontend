const RAW_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

function buildUrl(path) {
  if (path.startsWith("http")) return path;
  return `${RAW_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

function parseJwtPayload(token) {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isValidAccessToken(token) {
  const payload = parseJwtPayload(token);
  return !!payload && payload.token_type === "access";
}

function isValidRefreshToken(token) {
  const payload = parseJwtPayload(token);
  return !!payload && payload.token_type === "refresh";
}

function getStoredAccessToken() {
  const token = localStorage.getItem("access");
  return isValidAccessToken(token) ? token : null;
}

function getStoredRefreshToken() {
  const token = localStorage.getItem("refresh");
  return isValidRefreshToken(token) ? token : null;
}

function clearAuthStorage() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  localStorage.removeItem("user_id");
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
      clearAuthStorage();
      return null;
    }

    const data = await res.json();

    if (isValidAccessToken(data?.access)) {
      localStorage.setItem("access", data.access);
      return data.access;
    }

    clearAuthStorage();
    return null;
  } catch (err) {
    console.error("Token refresh failed:", err);
    clearAuthStorage();
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

// Public requests: never attach Authorization
export async function publicFetch(path, options = {}) {
  const url = buildUrl(path);

  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  console.log("🌍 PUBLIC API CALL:", url);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return handleResponse(response);
}

// Private requests: attach only a valid ACCESS token
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
  } else {
    console.warn("No valid access token found. Sending request without Authorization header:", url);
  }

  console.log("🌍 API CALL:", url);

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