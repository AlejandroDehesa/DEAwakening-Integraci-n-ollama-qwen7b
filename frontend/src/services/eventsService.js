import { apiRequest } from "./api";
import { normalizeLocalizedDeep } from "../utils/textNormalization";

export async function getEvents(language = "en") {
  const data = await apiRequest(`/api/events?lang=${language}`);
  return normalizeLocalizedDeep(data, language);
}

export async function getEventBySlug(slug, language = "en") {
  const data = await apiRequest(`/api/events/${slug}?lang=${language}`);
  return normalizeLocalizedDeep(data, language);
}

export function registerForEvent(eventId, payload) {
  return apiRequest(`/api/events/${eventId}/register`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getAdminEvents() {
  return apiRequest("/api/admin/events").then((events) =>
    events.map((eventItem) => ({
      ...eventItem,
      translations: {
        en: normalizeLocalizedDeep(eventItem.translations?.en || {}, "en"),
        es: normalizeLocalizedDeep(eventItem.translations?.es || {}, "es"),
        de: normalizeLocalizedDeep(eventItem.translations?.de || {}, "de")
      }
    }))
  );
}

export function createAdminEvent(payload) {
  return apiRequest("/api/admin/events", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateAdminEvent(eventId, payload) {
  return apiRequest(`/api/admin/events/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteAdminEvent(eventId) {
  return apiRequest(`/api/admin/events/${eventId}`, {
    method: "DELETE"
  });
}
