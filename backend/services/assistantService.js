import { normalizeLanguage } from "./languageUtils.js";
import {
  buildAssistantMessages,
  parseAssistantOutput
} from "./promptBuilder.js";
import { fetchSiteKnowledge } from "./siteKnowledgeService.js";

const VALID_PAGE_CONTEXTS = new Set([
  "home",
  "events",
  "event-detail",
  "about",
  "book",
  "contact",
  "host-event"
]);

function createPublicError(status, message) {
  const error = new Error(message);
  error.status = status;
  error.expose = true;
  return error;
}

export function validateAssistantChatPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      success: false,
      error: "Request body must be a JSON object"
    };
  }

  const rawMessage = typeof payload.message === "string" ? payload.message.trim() : "";
  if (!rawMessage) {
    return {
      success: false,
      error: "message is required"
    };
  }

  if (rawMessage.length > 4000) {
    return {
      success: false,
      error: "message is too long"
    };
  }

  const rawLanguage = payload.language;
  const language =
    rawLanguage === undefined || rawLanguage === null || rawLanguage === ""
      ? "en"
      : normalizeLanguage(rawLanguage);

  if (
    rawLanguage !== undefined &&
    rawLanguage !== null &&
    rawLanguage !== "" &&
    !["en", "es", "de"].includes(rawLanguage)
  ) {
    return {
      success: false,
      error: "language must be one of: en, es, de"
    };
  }

  const sessionId =
    typeof payload.sessionId === "string" && payload.sessionId.trim()
      ? payload.sessionId.trim()
      : null;

  if (sessionId && sessionId.length > 120) {
    return {
      success: false,
      error: "sessionId is too long"
    };
  }

  const pageContext =
    typeof payload.pageContext === "string" && payload.pageContext.trim()
      ? payload.pageContext.trim()
      : null;

  if (pageContext && !VALID_PAGE_CONTEXTS.has(pageContext)) {
    return {
      success: false,
      error:
        "pageContext must be one of: home, events, event-detail, about, book, contact, host-event"
    };
  }

  const pageSlug =
    typeof payload.pageSlug === "string" && payload.pageSlug.trim()
      ? payload.pageSlug.trim()
      : null;

  if (pageSlug && pageSlug.length > 180) {
    return {
      success: false,
      error: "pageSlug is too long"
    };
  }

  return {
    success: true,
    data: {
      message: rawMessage,
      language,
      sessionId,
      pageContext,
      pageSlug
    }
  };
}

async function callOpenAI(messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey) {
    throw createPublicError(
      503,
      "Assistant is not configured: missing OPENAI_API_KEY"
    );
  }

  if (!model) {
    throw createPublicError(
      503,
      "Assistant is not configured: missing OPENAI_MODEL"
    );
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages
    })
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const apiMessage =
      payload?.error?.message ||
      payload?.message ||
      `OpenAI request failed with status ${response.status}`;
    throw createPublicError(502, `Assistant provider error: ${apiMessage}`);
  }

  const rawContent = payload?.choices?.[0]?.message?.content;
  if (typeof rawContent !== "string" || !rawContent.trim()) {
    throw createPublicError(
      502,
      "Assistant provider returned an empty response"
    );
  }

  return rawContent;
}

export async function generateAssistantChatResponse(input) {
  const knowledge = await fetchSiteKnowledge({
    language: input.language,
    pageContext: input.pageContext,
    pageSlug: input.pageSlug
  });

  const messages = buildAssistantMessages({
    language: input.language,
    message: input.message,
    sessionId: input.sessionId,
    pageContext: input.pageContext,
    pageSlug: input.pageSlug,
    knowledge
  });

  const rawModelOutput = await callOpenAI(messages);

  let parsedOutput;
  try {
    parsedOutput = parseAssistantOutput(
      rawModelOutput,
      knowledge.availableEventSlugs
    );
  } catch (error) {
    throw createPublicError(
      502,
      `Assistant provider returned invalid structured output: ${error.message}`
    );
  }

  return {
    answer: parsedOutput.answer,
    language: input.language,
    intent: parsedOutput.intent,
    suggestedCtas: parsedOutput.suggestedCtas,
    recommendedEventSlug: parsedOutput.recommendedEventSlug
  };
}
