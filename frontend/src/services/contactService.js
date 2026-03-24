import { apiRequest } from "./api";

export function sendContactMessage(payload) {
  return apiRequest("/api/contact", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
