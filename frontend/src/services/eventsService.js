import { apiRequest } from "./api";

export function getEvents() {
  return apiRequest("/api/events");
}

export function getEventBySlug(slug) {
  return apiRequest(`/api/events/${slug}`);
}
