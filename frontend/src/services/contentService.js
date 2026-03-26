import { apiRequest } from "./api";
import { normalizeLocalizedDeep } from "../utils/textNormalization";

export async function getSectionContent(sectionKey, language = "en") {
  const data = await apiRequest(`/api/content/${sectionKey}?lang=${language}`);
  return normalizeLocalizedDeep(data, language);
}

export async function getSectionExtra(sectionKey, language = "en", fallback = {}) {
  const section = await getSectionContent(sectionKey, language);
  if (!section?.extra || typeof section.extra !== "object") {
    return fallback;
  }

  return section.extra;
}

export function getAdminContent() {
  return apiRequest("/api/admin/content").then((sections) =>
    sections.map((section) => ({
      ...section,
      translations: {
        en: normalizeLocalizedDeep(section.translations?.en || {}, "en"),
        es: normalizeLocalizedDeep(section.translations?.es || {}, "es"),
        de: normalizeLocalizedDeep(section.translations?.de || {}, "de")
      }
    }))
  );
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
