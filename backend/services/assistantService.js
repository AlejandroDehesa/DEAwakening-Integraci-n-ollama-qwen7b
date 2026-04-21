import { normalizeLanguage } from "./languageUtils.js";
import { buildAssistantKnowledge } from "./assistantKnowledgeOrchestrator.js";
import {
  buildAssistantMessages,
  parseAssistantOutput
} from "./promptBuilder.js";

const MAX_MESSAGE_LENGTH = 4000;
const MAX_SESSION_ID_LENGTH = 120;
const MAX_PAGE_SLUG_LENGTH = 180;
const MAX_USER_NAME_LENGTH = 60;
const SLUG_PATTERN = /^[a-z0-9-]+$/i;
const USER_NAME_PATTERN = /^[a-zA-ZÀ-ÿ\u00f1\u00d1' -]+$/;

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
  const hasLanguageInput =
    rawLanguage !== undefined && rawLanguage !== null && rawLanguage !== "";
  const language =
    !hasLanguageInput
      ? "en"
      : normalizeLanguage(rawLanguage);

  if (hasLanguageInput) {
    const languageInput =
      typeof rawLanguage === "string" ? rawLanguage.trim().toLowerCase() : "";
    if (!["en", "es", "de"].includes(languageInput)) {
      return {
        success: false,
        error: "language must be one of: en, es, de"
      };
    }
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

  const userName =
    typeof payload.userName === "string" && payload.userName.trim()
      ? payload.userName.trim().replace(/\s+/g, " ").slice(0, MAX_USER_NAME_LENGTH)
      : null;

  if (userName) {
    if (userName.length < 2) {
      return {
        success: false,
        error: "userName must be at least 2 characters"
      };
    }

    if (!USER_NAME_PATTERN.test(userName)) {
      return {
        success: false,
        error: "userName has an invalid format"
      };
    }
  }

  return {
    success: true,
    data: {
      message: rawMessage,
      language,
      sessionId,
      pageContext,
      pageSlug,
      userName
    }
  };
}

function trimTrailingSlashes(value) {
  return String(value || "").replace(/\/+$/, "");
}

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeActions(items) {
  const result = [];
  const seen = new Set();

  for (const item of Array.isArray(items) ? items : []) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const type = typeof item.type === "string" ? item.type : "";
    const target = typeof item.target === "string" ? item.target : "";
    const label = typeof item.label === "string" ? item.label : "";

    if (!type || !target || !label) {
      continue;
    }

    const key = `${type}:${target}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push({ type, target, label });
  }

  return result;
}

function dedupeLinks(items, actionTargets = new Set()) {
  const result = [];
  const seen = new Set();

  for (const item of Array.isArray(items) ? items : []) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const label = typeof item.label === "string" ? item.label : "";
    const target = typeof item.target === "string" ? item.target : "";
    if (!label || !target || actionTargets.has(target)) {
      continue;
    }

    if (seen.has(target)) {
      continue;
    }

    seen.add(target);
    result.push({ label, target });
  }

  return result;
}

const EVENT_QUERY_HINTS = [
  "evento",
  "evento ",
  "eventos",
  "event",
  "events",
  "veranstaltung",
  "veranstaltungen",
  "fecha",
  "date",
  "ticket",
  "tickets",
  "entrada",
  "entradas",
  "resofusion"
];

const FAVORITE_QUERY_HINTS = [
  "favorito",
  "favorita",
  "favorite",
  "favourite",
  "liebling"
];


function isEventFocusedQuery(message, pageContext) {
  if (pageContext === "events" || pageContext === "event-detail") {
    return true;
  }

  const normalizedMessage = normalizeText(message);
  if (!normalizedMessage) {
    return false;
  }

  return EVENT_QUERY_HINTS.some((hint) => normalizedMessage.includes(hint));
}

function isFavoriteStyleQuery(message) {
  const normalizedMessage = normalizeText(message);
  if (!normalizedMessage) {
    return false;
  }

  return FAVORITE_QUERY_HINTS.some((hint) => normalizedMessage.includes(hint));
}

function scoreEventForQuery(eventItem, normalizedMessage) {
  if (!eventItem || !normalizedMessage) {
    return 0;
  }

  const haystack = normalizeText(
    `${eventItem.slug || ""} ${eventItem.title || ""} ${eventItem.location || ""} ${eventItem.description || ""}`
  );

  if (!haystack) {
    return 0;
  }

  const tokens = normalizedMessage.split(" ").filter((token) => token.length > 2);
  let score = 0;

  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += 1;
    }
  }

  return score;
}

function getRecommendedEventSlug({ message, pageContext, pageSlug, siteKnowledge, parsedOutput }) {
  const upcomingEvents = Array.isArray(siteKnowledge?.events?.upcoming)
    ? siteKnowledge.events.upcoming
    : [];

  const availableEventSlugs = upcomingEvents
    .map((eventItem) => eventItem?.slug)
    .filter((slug) => typeof slug === "string" && slug.trim());

  if (availableEventSlugs.length === 0) {
    return null;
  }

  if (pageContext === "event-detail" && pageSlug && availableEventSlugs.includes(pageSlug)) {
    return pageSlug;
  }

  const normalizedMessage = normalizeText(message);

  if (
    typeof parsedOutput?.recommendedEventSlug === "string" &&
    availableEventSlugs.includes(parsedOutput.recommendedEventSlug)
  ) {
    const suggestedEvent = upcomingEvents.find(
      (eventItem) => eventItem.slug === parsedOutput.recommendedEventSlug
    );
    const suggestedScore = scoreEventForQuery(suggestedEvent, normalizedMessage);
    if (suggestedScore > 0) {
      return parsedOutput.recommendedEventSlug;
    }
  }

  const ranked = upcomingEvents
    .map((eventItem) => ({
      slug: eventItem.slug,
      score: scoreEventForQuery(eventItem, normalizedMessage)
    }))
    .sort((a, b) => b.score - a.score);

  if (ranked[0]?.score > 0 && ranked[0]?.slug) {
    return ranked[0].slug;
  }

  return null;
}

function getEventTitleBySlug(siteKnowledge, slug) {
  if (!slug || !siteKnowledge?.events?.upcoming) {
    return null;
  }

  const match = siteKnowledge.events.upcoming.find((eventItem) => eventItem.slug === slug);
  if (!match || typeof match.title !== "string" || !match.title.trim()) {
    return null;
  }

  return match.title.trim();
}

function eventActionLabelByLanguage(language) {
  if (language === "es") {
    return "Ver evento recomendado";
  }

  if (language === "de") {
    return "Empfohlenes Event ansehen";
  }

  return "View recommended event";
}

function routeToEventsAction(language) {
  if (language === "es") {
    return { type: "route", label: "Ver eventos", target: "/events" };
  }

  if (language === "de") {
    return { type: "route", label: "Events ansehen", target: "/events" };
  }

  return { type: "route", label: "Explore events", target: "/events" };
}

/* function buildListEventsAnswer(language, upcomingEvents) {
  const items = (Array.isArray(upcomingEvents) ? upcomingEvents : [])
    .map((eventItem) => ({
      title: typeof eventItem?.title === "string" ? eventItem.title.trim() : "",
      location: typeof eventItem?.location === "string" ? eventItem.location.trim() : "",
      date: formatEventDate(eventItem?.date, language)
    }))
    .filter((eventItem) => eventItem.title)
    .slice(0, 14);

  if (items.length === 0) {
    if (language === "es") {
      return "Ahora mismo no hay eventos publicados. Si quieres, puedo avisarte de los próximos en cuanto estén visibles.";
    }
    if (language === "de") {
      return "Aktuell sind keine Veranstaltungen veröffentlicht. Ich kann dir bei den nächsten Terminen helfen, sobald sie sichtbar sind.";
    }
    return "There are no published events right now. I can help you review upcoming ones as soon as they are available.";
  }

  const compact = items
    .map((item) => `${item.title} (${item.location}${item.date ? `, ${item.date}` : ""})`)
    .join(" · ");

  if (language === "es") {
    return `Ahora mismo hay ${items.length} eventos publicados: ${compact}. Si quieres, te ayudo a elegir el mejor para ti.`;
  }

  if (language === "de") {
    return `Aktuell gibt es ${items.length} veröffentlichte Veranstaltungen: ${compact}. Wenn du willst, helfe ich dir bei der Auswahl.`;
  }

  return `There are currently ${items.length} published events: ${compact}. If you want, I can help you choose the best fit.`;
} */

function postProcessAssistantOutput({ parsedOutput, input, siteKnowledge }) {
  const eventFocused = isEventFocusedQuery(input.message, input.pageContext);
  const favoriteStyleQuery = isFavoriteStyleQuery(input.message);
  const isEventIntent = parsedOutput.pageIntent === "event_discovery";
  const shouldRecommendEvent = eventFocused && isEventIntent && !favoriteStyleQuery;

  const next = {
    ...parsedOutput,
    suggestedActions: dedupeActions(parsedOutput.suggestedActions),
    relatedLinks: Array.isArray(parsedOutput.relatedLinks) ? [...parsedOutput.relatedLinks] : []
  };

  if (!shouldRecommendEvent) {
    next.recommendedEventSlug = null;
    next.recommendedEventTitle = null;
    next.suggestedActions = next.suggestedActions.filter((action) => {
      if (action.type === "event") {
        return false;
      }

      return !/^\/events\/[a-z0-9-]+$/i.test(action.target);
    });
  } else {
    const slug = getRecommendedEventSlug({
      message: input.message,
      pageContext: input.pageContext,
      pageSlug: input.pageSlug,
      siteKnowledge,
      parsedOutput
    });

    next.recommendedEventSlug = slug;
    next.recommendedEventTitle = getEventTitleBySlug(siteKnowledge, slug);

    if (slug) {
      const eventTarget = `/events/${slug}`;
      const hasEventAction = next.suggestedActions.some(
        (action) => action.target === eventTarget
      );

      if (!hasEventAction) {
        next.suggestedActions.unshift({
          type: "event",
          label: eventActionLabelByLanguage(input.language),
          target: eventTarget
        });
      }
    }
  }

  if (favoriteStyleQuery) {
    next.recommendedEventSlug = null;
    next.recommendedEventTitle = null;
    next.suggestedActions = next.suggestedActions.filter((action) => {
      if (action.type === "event") {
        return false;
      }

      return !/^\/events\/[a-z0-9-]+$/i.test(action.target);
    });

    if (!next.suggestedActions.some((action) => action.target === "/events")) {
      next.suggestedActions.unshift(routeToEventsAction(input.language));
    }
  }

  next.suggestedActions = dedupeActions(next.suggestedActions).slice(0, 5);
  const actionTargets = new Set(next.suggestedActions.map((action) => action.target));
  next.relatedLinks = dedupeLinks(next.relatedLinks, actionTargets).slice(0, 5);

  return next;
}

async function callProvider(messages) {
  const model = process.env.OLLAMA_MODEL || "qwen:7b";
  const baseUrl = trimTrailingSlashes(process.env.OLLAMA_BASE_URL || "http://localhost:11434");
  const timeoutMs = Number(
    process.env.OLLAMA_TIMEOUT_MS ||
    process.env.OPENROUTER_TIMEOUT_MS ||
    process.env.OPENAI_TIMEOUT_MS ||
    15000
  );

  const baseSystemPrompt = "Eres un asistente de esta web. Responde de forma clara y útil.";
  const safeMessages = Array.isArray(messages)
    ? messages.filter(
        (messageItem) =>
          messageItem &&
          typeof messageItem === "object" &&
          typeof messageItem.role === "string" &&
          typeof messageItem.content === "string"
      )
    : [];

  const sourceSystemMessage = safeMessages.find((messageItem) => messageItem.role === "system");
  const sourceUserMessage = [...safeMessages].reverse().find(
    (messageItem) => messageItem.role === "user"
  );
  const ollamaMessages = [
    {
      role: "system",
      content: sourceSystemMessage?.content
        ? `${baseSystemPrompt}\n\n${sourceSystemMessage.content}`
        : baseSystemPrompt
    },
    {
      role: "user",
      content: sourceUserMessage?.content || ""
    }
  ];

  if (!ollamaMessages[1].content.trim()) {
    throw createAssistantError({
      status: 400,
      code: "assistant_invalid_input",
      message: "Assistant provider request is missing user content"
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  let payload = null;
  const endpoint = `${baseUrl}/api/chat`;

  console.log(
    `[assistant] provider_request provider=ollama endpoint=${endpoint} model=${model} messageCount=${ollamaMessages.length} userContentLength=${ollamaMessages[1].content.length}`
  );

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: ollamaMessages,
        stream: false
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
      payload?.error ||
      payload?.message ||
      `Provider request failed with status ${response.status}`;
    console.error(
      `[assistant] provider_response provider=ollama status=${response.status} error="${apiMessage}"`
    );
    throw createAssistantError({
      status: 502,
      code: "assistant_provider_error",
      message: `Assistant provider error: ${apiMessage}`
    });
  }

  const rawContent = payload?.message?.content;
  if (typeof rawContent !== "string" || !rawContent.trim()) {
    throw createAssistantError({
      status: 502,
      code: "assistant_empty_provider_response",
      message: "Assistant provider returned an empty response"
    });
  }

  console.log(
    `[assistant] provider_response provider=ollama status=${response.status} contentLength=${rawContent.length}`
  );

  return rawContent;
}

export async function generateAssistantChatResponse(input) {
  let assistantKnowledge;

  try {
    assistantKnowledge = await buildAssistantKnowledge({
      language: input.language,
      pageContext: input.pageContext,
      pageSlug: input.pageSlug,
      message: input.message
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
    userName: input.userName,
    siteKnowledge: assistantKnowledge.siteKnowledge,
    documentKnowledge: assistantKnowledge.documentKnowledge
  });

  const rawModelOutput = await callProvider(messages);

  let parsedOutput;
  try {
    parsedOutput = parseAssistantOutput(
      rawModelOutput,
      {
        language: input.language,
        availableEventSlugs: assistantKnowledge.availableEventSlugs
      }
    );
  } catch (error) {
    throw createAssistantError({
      status: 502,
      code: "assistant_invalid_provider_output",
      message: `Assistant provider returned invalid structured output: ${error.message}`
    });
  }

  const finalOutput = postProcessAssistantOutput({
    parsedOutput,
    input,
    siteKnowledge: assistantKnowledge.siteKnowledge
  });

  return {
    contractVersion: "assistant.v2",
    answer: finalOutput.answer,
    language: input.language,
    pageIntent: finalOutput.pageIntent,
    confidence: finalOutput.confidence,
    suggestedActions: finalOutput.suggestedActions,
    relatedLinks: finalOutput.relatedLinks,
    recommendedEventSlug: finalOutput.recommendedEventSlug,
    recommendedEventTitle: finalOutput.recommendedEventTitle || null,

    // Backward compatibility alias.
    intent: finalOutput.pageIntent,
    knowledgeStatus: {
      site: "ok",
      documents: assistantKnowledge.documentKnowledge.status
    }
  };
}
