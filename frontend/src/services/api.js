const ADMIN_KEY = "admin123";

export async function apiRequest(path, options = {}) {
  const isAdminRequest = path.startsWith("/api/admin");

  const response = await fetch(path, {
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
