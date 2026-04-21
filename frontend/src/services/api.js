const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const ADMIN_KEY_STORAGE = "deawakening_admin_key";
const DEV_ADMIN_KEY = import.meta.env.DEV ? import.meta.env.VITE_ADMIN_KEY : "";

function readStoredAdminKey() {
  if (typeof window === "undefined") {
    return "";
  }

  return (window.sessionStorage.getItem(ADMIN_KEY_STORAGE) || "").trim();
}

export function saveAdminKey(key) {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = String(key || "").trim();
  if (!normalized) {
    window.sessionStorage.removeItem(ADMIN_KEY_STORAGE);
    return;
  }

  window.sessionStorage.setItem(ADMIN_KEY_STORAGE, normalized);
}

export function clearAdminKey() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(ADMIN_KEY_STORAGE);
}

export function hasAdminKey() {
  return Boolean(getEffectiveAdminKey());
}

export function getEffectiveAdminKey() {
  return readStoredAdminKey() || String(DEV_ADMIN_KEY || "").trim();
}

export async function apiRequest(path, options = {}) {
  const isAdminRequest = path.startsWith("/api/admin");
  const requestUrl = `${API_BASE_URL}${path}`;
  const adminKey = getEffectiveAdminKey();

  if (isAdminRequest && !adminKey) {
    throw new Error("Admin key is not configured. Add it in /admin access.");
  }

  const response = await fetch(requestUrl, {
    headers: {
      "Content-Type": "application/json",
      ...(isAdminRequest ? { "x-admin-key": adminKey } : {}),
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
