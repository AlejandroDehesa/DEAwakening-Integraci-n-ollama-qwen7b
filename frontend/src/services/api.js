const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY;

export async function apiRequest(path, options = {}) {
  const isAdminRequest = path.startsWith("/api/admin");
  const requestUrl = `${API_BASE_URL}${path}`;

  if (isAdminRequest && !ADMIN_KEY) {
    throw new Error("Admin key is not configured");
  }

  const response = await fetch(requestUrl, {
    headers: {
      "Content-Type": "application/json",
      ...(isAdminRequest ? { "x-admin-key": ADMIN_KEY } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || "Something went wrong");
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    if (!payload.success) {
      throw new Error(payload.error || "Request failed");
    }

    return payload.data;
  }

  return payload;
}
