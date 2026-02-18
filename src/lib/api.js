// 1) Base URL of backend API.
// - First try to read it from .env (VITE_API_URL)
// - If not found, use local backend default (localhost)
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// 2) Small helper: get JWT access token from browser storage.
// If token exists, user is logged in.
function getToken() {
  return localStorage.getItem("accessToken");
}

// 3) apiFetch(): wrapper around fetch() that handles:
// - Base URL + endpoint path
// - JSON headers
// - Auto attach JWT token (Authorization header)
// - Safe JSON parsing
// - Consistent error handling
export async function apiFetch(path, options = {}) {
  // Build final URL: BASE_URL + endpoint path
  // Example: http://127.0.0.1:8000/api + /grounds/ => http://127.0.0.1:8000/api/grounds/
  const url = `${BASE_URL}${path}`;

  // Default headers: we send JSON in most requests
  // Merge additional headers if caller provides any
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Attach JWT token (if logged in)
  // Backend will use it to identify the user
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Make the HTTP request
  // Spread options so method/body/etc. are preserved
  const res = await fetch(url, { ...options, headers });

  // ---- Safe response parsing ----
  // Read response as text first (works even if empty)
  let data = null;
  const text = await res.text();

  // If response contains JSON, parse it. If not, keep it as raw text.
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  // ---- Error handling ----
  // res.ok means status code 200-299
  // If not ok, throw an error with a useful message from backend
  if (!res.ok) {
    // Django commonly returns { detail: "..." }
    // Some APIs return { message: "..." }
    const msg =
      (data && data.detail) ||
      (data && data.message) ||
      "Request failed";

    throw new Error(msg);
  }

  // If everything is OK, return parsed data to the caller
  return data;
}
