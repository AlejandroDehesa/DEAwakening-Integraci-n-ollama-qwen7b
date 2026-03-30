import { apiRequest } from "./api";

function normalizeAssistantArray(items, expectedKeys) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && typeof item === "object")
    .map((item) =>
      expectedKeys.reduce((result, key) => {
        result[key] = typeof item[key] === "string" ? item[key] : "";
        return result;
      }, {})
    )
    .filter((item) => expectedKeys.every((key) => item[key]));
}

export function sendAssistantChat(payload) {
  return apiRequest("/api/assistant/chat", {
    method: "POST",
    body: JSON.stringify(payload)
  }).then((data) => ({
    contractVersion: typeof data?.contractVersion === "string" ? data.contractVersion : "",
    answer: typeof data?.answer === "string" ? data.answer : "",
    language: typeof data?.language === "string" ? data.language : "en",
    pageIntent:
      typeof data?.pageIntent === "string"
        ? data.pageIntent
        : typeof data?.intent === "string"
          ? data.intent
          : "guidance",
    confidence: typeof data?.confidence === "number" ? data.confidence : null,
    suggestedActions: normalizeAssistantArray(
      data?.suggestedActions,
      ["type", "label", "target"]
    ),
    relatedLinks: normalizeAssistantArray(data?.relatedLinks, ["label", "target"]),
    knowledgeStatus:
      data?.knowledgeStatus && typeof data.knowledgeStatus === "object"
        ? {
            site:
              typeof data.knowledgeStatus.site === "string"
                ? data.knowledgeStatus.site
                : "ok",
            documents:
              typeof data.knowledgeStatus.documents === "string"
                ? data.knowledgeStatus.documents
                : "empty"
          }
        : { site: "ok", documents: "empty" },
    interactionId:
      Number.isInteger(data?.interactionId) && data.interactionId > 0
        ? data.interactionId
        : null,
    recommendedEventSlug:
      typeof data?.recommendedEventSlug === "string" ? data.recommendedEventSlug : null
  }));
}

export async function trackAssistantClick(payload) {
  try {
    await apiRequest("/api/assistant/track-click", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  } catch {
    // Tracking must never break UX.
  }
}
