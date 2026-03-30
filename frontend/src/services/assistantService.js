import { apiRequest } from "./api";

export function sendAssistantChat(payload) {
  return apiRequest("/api/assistant/chat", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
