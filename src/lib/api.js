let BACKEND_ROOT =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

BACKEND_ROOT = BACKEND_ROOT.replace(/\/+$/, "");

function getToken() {
  return localStorage.getItem("access");
}

async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  let data;

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = text ? { detail: text } : {};
  }

  if (!res.ok) {
    const msg =
      data?.detail ||
      data?.message ||
      data?.error ||
      `Request failed (${res.status})`;

    throw new Error(msg);
  }

  return data;
}

export async function apiFetch(path, options = {}) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  const url = `${BACKEND_ROOT}${safePath}`;

  console.log("🌍 API CALL:", url);

  const headers = { ...(options.headers || {}) };
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = options.body instanceof FormData;
  const hasBody = options.body !== undefined && options.body !== null;

  if (!isFormData && hasBody) {
    headers["Content-Type"] = "application/json";

    if (typeof options.body !== "string") {
      options.body = JSON.stringify(options.body);
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  return handleResponse(res);
}

export async function publicFetch(path, options = {}) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  const url = `${BACKEND_ROOT}${safePath}`;

  console.log("🌍 PUBLIC API CALL:", url);

  const headers = { ...(options.headers || {}) };

  const isFormData = options.body instanceof FormData;
  const hasBody = options.body !== undefined && options.body !== null;

  if (!isFormData && hasBody) {
    headers["Content-Type"] = "application/json";

    if (typeof options.body !== "string") {
      options.body = JSON.stringify(options.body);
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  return handleResponse(res);
}