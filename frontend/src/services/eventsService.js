import { apiRequest } from "./api";

export function getEvents(language = "en") {
  return apiRequest(`/api/events?lang=${language}`);
}

export function getEventBySlug(slug, language = "en") {
  return apiRequest(`/api/events/${slug}?lang=${language}`);
}

export function registerForEvent(eventId, payload) {
  return apiRequest(`/api/events/${eventId}/register`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getAdminEvents() {
  return apiRequest("/api/admin/events");
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
