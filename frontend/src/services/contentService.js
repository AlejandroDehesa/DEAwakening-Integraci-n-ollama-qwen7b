import { apiRequest } from "./api";

export function getSectionContent(sectionKey, language = "en") {
  return apiRequest(`/api/content/${sectionKey}?lang=${language}`);
}

export function getAdminContent() {
  return apiRequest("/api/admin/content");
}

export function updateAdminContent(sectionKey, payload) {
  return apiRequest(`/api/admin/content/${sectionKey}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function parseBodyItems(body = "") {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split(":");

      return {
        title: title?.trim() || "",
        body: rest.join(":").trim()
      };
    });
}
