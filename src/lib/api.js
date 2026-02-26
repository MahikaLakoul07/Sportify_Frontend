// src/lib/api.js

// 1️⃣ Get backend root from .env or fallback
let BACKEND_ROOT =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// 2️⃣ IMPORTANT FIX:
// If .env accidentally includes "/api" at the end,
// remove it to prevent double "/api/api" issue.
BACKEND_ROOT = BACKEND_ROOT.replace(/\/api\/?$/, "");

// 3️⃣ Get JWT token
function getToken() {
  return localStorage.getItem("access") || localStorage.getItem("accessToken");
}

export async function apiFetch(path, options = {}) {
  // 4️⃣ Always ensure path starts with "/"
  const safePath = path.startsWith("/") ? path : `/${path}`;

  // 5️⃣ Build final URL
  const url = `${BACKEND_ROOT}${safePath}`;

  console.log("🌍 API CALL:", url); // debug line (keep for now)

  const headers = { ...(options.headers || {}) };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const isFormData = options.body instanceof FormData;

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
    if (options.body && typeof options.body !== "string") {
      options.body = JSON.stringify(options.body);
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType = res.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
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