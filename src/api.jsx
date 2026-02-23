export async function apiFetch(url, options = {}) {
  const headers = {};

  // Attach access token from localStorage if present
  const access = localStorage.getItem("access");
  if (access) {
    headers["Authorization"] = `Bearer ${access}`;
  }

  // If body is NOT FormData, send JSON
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    if (options.body) options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
    credentials: "include", // in case you still use cookies anywhere
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
    const errorMessage =
      data?.detail ||
      data?.error ||
      `Request failed with status ${res.status}`;
    throw new Error(errorMessage);
  }

  return data;
}