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
    recommendedEventSlug:
      typeof data?.recommendedEventSlug === "string" ? data.recommendedEventSlug : null
  }));
}
