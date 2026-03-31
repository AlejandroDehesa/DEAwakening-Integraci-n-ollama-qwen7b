import { normalizeLanguage } from "./languageUtils.js";
import { buildAssistantKnowledge } from "./assistantKnowledgeOrchestrator.js";
import {
  buildAssistantMessages,
  parseAssistantOutput
} from "./promptBuilder.js";

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
  "resofusion",
  "dea"
];

const FAVORITE_QUERY_HINTS = [
  "favorito",
  "favorita",
  "favorite",
  "favourite",
  "liebling"
];

const LIST_EVENTS_QUERY_HINTS = [
  "dime todos los eventos",
  "todos los eventos",
  "que eventos hay",
  "cuales son los eventos",
  "list events",
  "all events",
  "show events",
  "alle veranstaltungen",
  "alle events",
  "welche events"
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

function isListEventsQuery(message) {
  const normalizedMessage = normalizeText(message);
  if (!normalizedMessage) {
    return false;
  }

  return LIST_EVENTS_QUERY_HINTS.some((hint) => normalizedMessage.includes(hint));
}

function formatEventDate(date, language) {
  if (!date) {
    return "";
  }

  try {
    const locale = language === "es" ? "es-ES" : language === "de" ? "de-DE" : "en-GB";
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(date));
  } catch {
    return String(date);
  }
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

function buildFavoriteQueryAnswer(language, upcomingEvents) {
  const topTitles = (Array.isArray(upcomingEvents) ? upcomingEvents : [])
    .map((eventItem) => eventItem?.title)
    .filter((title) => typeof title === "string" && title.trim())
    .slice(0, 3);

  if (language === "es") {
    if (topTitles.length === 0) {
      return "No tengo eventos favoritos. Puedo ayudarte a elegir segun ciudad, fecha o formato con la lista actual.";
    }

    return `No tengo un evento favorito. Ahora mismo puedes revisar: ${topTitles.join(", ")}. Si quieres, te ayudo a elegir el mejor para ti.`;
  }

  if (language === "de") {
    if (topTitles.length === 0) {
      return "Ich habe kein Lieblings-Event. Ich kann dir helfen, nach Stadt, Datum oder Format aus den aktuellen Veranstaltungen zu wahlen.";
    }

    return `Ich habe kein Lieblings-Event. Aktuelle Optionen sind: ${topTitles.join(", ")}. Wenn du willst, helfe ich dir bei der Auswahl.`;
  }

  if (topTitles.length === 0) {
    return "I do not have a favorite event. I can help you choose by city, date, or format from current events.";
  }

  return `I do not have a favorite event. Current options include: ${topTitles.join(", ")}. If you want, I can help you choose the best fit.`;
}

function buildListEventsAnswer(language, upcomingEvents) {
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
}

function postProcessAssistantOutput({ parsedOutput, input, siteKnowledge }) {
  const eventFocused = isEventFocusedQuery(input.message, input.pageContext);
  const favoriteStyleQuery = isFavoriteStyleQuery(input.message);
  const listEventsQuery = isListEventsQuery(input.message);
  const upcomingEvents = Array.isArray(siteKnowledge?.events?.upcoming)
    ? siteKnowledge.events.upcoming
    : [];

  const next = {
    ...parsedOutput,
    suggestedActions: dedupeActions(parsedOutput.suggestedActions),
    relatedLinks: Array.isArray(parsedOutput.relatedLinks) ? [...parsedOutput.relatedLinks] : []
  };

  if (!eventFocused) {
    next.recommendedEventSlug = null;
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
    next.answer = buildFavoriteQueryAnswer(input.language, upcomingEvents);
    next.pageIntent = "event_discovery";
    next.recommendedEventSlug = null;
    next.suggestedActions = [routeToEventsAction(input.language)];
    next.relatedLinks = [];
  }

  if (listEventsQuery) {
    next.answer = buildListEventsAnswer(input.language, upcomingEvents);
    next.pageIntent = "event_discovery";
    next.recommendedEventSlug = null;
    next.suggestedActions = [routeToEventsAction(input.language)];
    next.relatedLinks = [];
  }

  next.suggestedActions = dedupeActions(next.suggestedActions).slice(0, 5);
  const actionTargets = new Set(next.suggestedActions.map((action) => action.target));
  next.relatedLinks = dedupeLinks(next.relatedLinks, actionTargets).slice(0, 5);

  return next;
}

async function callProvider(messages) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  const model = process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL;
  const baseUrl = trimTrailingSlashes(
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"
  );
  const siteUrl = process.env.OPENROUTER_SITE_URL || "";
  const appName = process.env.OPENROUTER_APP_NAME || "";
  const timeoutMs = Number(
    process.env.OPENROUTER_TIMEOUT_MS ||
    process.env.OPENAI_TIMEOUT_MS ||
    15000
  );

  if (!apiKey) {
    throw createAssistantError({
      status: 503,
      code: "assistant_missing_api_key",
      message: "Assistant is not configured: missing OPENROUTER_API_KEY"
    });
  }

  if (!model) {
    throw createAssistantError({
      status: 503,
      code: "assistant_missing_model",
      message: "Assistant is not configured: missing OPENROUTER_MODEL"
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  let payload = null;

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    };

    if (siteUrl) {
      headers["HTTP-Referer"] = siteUrl;
    }

    if (appName) {
      headers["X-Title"] = appName;
    }

    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
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
      `Provider request failed with status ${response.status}`;
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

    // Backward compatibility alias.
    intent: finalOutput.pageIntent,
    knowledgeStatus: {
      site: "ok",
      documents: assistantKnowledge.documentKnowledge.status
    }
  };
}
