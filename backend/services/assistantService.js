import { normalizeLanguage } from "./languageUtils.js";
import {
  buildAssistantMessages,
  parseAssistantOutput
} from "./promptBuilder.js";
import { fetchSiteKnowledge } from "./siteKnowledgeService.js";

const MAX_MESSAGE_LENGTH = 4000;
const MAX_SESSION_ID_LENGTH = 120;
const MAX_PAGE_SLUG_LENGTH = 180;
const SLUG_PATTERN = /^[a-z0-9-]+$/i;

const VALID_PAGE_CONTEXTS = new Set([
  "home",
  "events",
  "event-detail",
  "about",
  "book",
  "contact",
  "host-event"
]);

function createAssistantError({ status, message, code }) {
  const error = new Error(message);
  error.status = status;
  error.expose = true;
  error.code = code;
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

  if (rawMessage.length > MAX_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `message must be ${MAX_MESSAGE_LENGTH} characters or less`
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
      error: `sessionId must be ${MAX_SESSION_ID_LENGTH} characters or less`
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

  if (pageSlug && pageSlug.length > MAX_PAGE_SLUG_LENGTH) {
    return {
      success: false,
      error: `pageSlug must be ${MAX_PAGE_SLUG_LENGTH} characters or less`
    };
  }

  if (pageSlug && !SLUG_PATTERN.test(pageSlug)) {
    return {
      success: false,
      error: "pageSlug has an invalid format"
    };
  }

  if (pageContext === "event-detail" && !pageSlug) {
    return {
      success: false,
      error: "pageSlug is required when pageContext is event-detail"
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
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 15000);

  if (!apiKey) {
    throw createAssistantError({
      status: 503,
      code: "assistant_missing_api_key",
      message: "Assistant is not configured: missing OPENAI_API_KEY"
    });
  }

  if (!model) {
    throw createAssistantError({
      status: 503,
      code: "assistant_missing_model",
      message: "Assistant is not configured: missing OPENAI_MODEL"
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  let payload = null;

  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages
      }),
      signal: controller.signal
    });

    payload = await response.json().catch(() => null);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createAssistantError({
        status: 504,
        code: "assistant_timeout",
        message: `Assistant provider timeout after ${timeoutMs}ms`
      });
    }

    throw createAssistantError({
      status: 502,
      code: "assistant_provider_unreachable",
      message: "Assistant provider request failed"
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const apiMessage =
      payload?.error?.message ||
      payload?.message ||
      `OpenAI request failed with status ${response.status}`;
    throw createAssistantError({
      status: 502,
      code: "assistant_provider_error",
      message: `Assistant provider error: ${apiMessage}`
    });
  }

  const rawContent = payload?.choices?.[0]?.message?.content;
  if (typeof rawContent !== "string" || !rawContent.trim()) {
    throw createAssistantError({
      status: 502,
      code: "assistant_empty_provider_response",
      message: "Assistant provider returned an empty response"
    });
  }

  return rawContent;
}

export async function generateAssistantChatResponse(input) {
  let knowledge;

  try {
    knowledge = await fetchSiteKnowledge({
      language: input.language,
      pageContext: input.pageContext,
      pageSlug: input.pageSlug
    });
  } catch {
    throw createAssistantError({
      status: 500,
      code: "assistant_knowledge_error",
      message: "Failed to build site knowledge for assistant"
    });
  }

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
      {
        language: input.language,
        availableEventSlugs: knowledge.availableEventSlugs
      }
    );
  } catch (error) {
    throw createAssistantError({
      status: 502,
      code: "assistant_invalid_provider_output",
      message: `Assistant provider returned invalid structured output: ${error.message}`
    });
  }

  return {
    answer: parsedOutput.answer,
    language: input.language,
    pageIntent: parsedOutput.pageIntent,
    confidence: parsedOutput.confidence,
    suggestedActions: parsedOutput.suggestedActions,
    relatedLinks: parsedOutput.relatedLinks,

    // Backward compatibility aliases for the previous contract.
    intent: parsedOutput.intent,
    suggestedCtas: parsedOutput.suggestedCtas,
    recommendedEventSlug: parsedOutput.recommendedEventSlug
  };
}
