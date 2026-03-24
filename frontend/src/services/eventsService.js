import { apiRequest } from "./api";

export function getEvents() {
  return apiRequest("/api/events");
}

export function getEventBySlug(slug) {
  return apiRequest(`/api/events/${slug}`);
}

export function registerForEvent(eventId, payload) {
  return apiRequest(`/api/events/${eventId}/register`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
