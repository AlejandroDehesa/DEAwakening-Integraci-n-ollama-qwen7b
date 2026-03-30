import crypto from "crypto";
import { all, run } from "../database/database.js";

const MAX_SESSION_ID_LENGTH = 120;
const MAX_PAGE_SLUG_LENGTH = 180;
const MAX_LABEL_LENGTH = 140;
const MAX_TARGET_LENGTH = 320;
const SLUG_PATTERN = /^[a-z0-9-]+$/i;

const VALID_LANGUAGES = new Set(["en", "es", "de"]);
const VALID_PAGE_CONTEXTS = new Set([
  "home",
  "events",
  "event-detail",
  "about",
  "book",
  "contact",
  "host-event"
]);
const VALID_CLICK_TYPES = new Set([
  "quick-action",
  "suggested-action",
  "related-link",
  "recommended-event"
]);
const VALID_SOURCES = new Set(["hero", "widget"]);

function safeJsonStringify(value) {
  try {
    return JSON.stringify(value || []);
  } catch {
    return "[]";
  }
}

function hashMessage(message) {
  return crypto.createHash("sha256").update(String(message)).digest("hex");
}

function trimString(value, maxLength) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxLength);
}

function parseJsonArray(value) {
  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function countBy(items, keyBuilder) {
  const map = new Map();

  for (const item of items) {
    const key = keyBuilder(item);
    if (!key) {
      continue;
    }

    map.set(key, (map.get(key) || 0) + 1);
  }

  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

function readTrackingEnabled() {
  const value = (process.env.ASSISTANT_TRACKING_ENABLED || "true").toLowerCase();
  return value !== "false" && value !== "0";
}

function normalizeLanguage(language) {
  if (typeof language !== "string") {
    return "en";
  }

  const normalized = language.trim().toLowerCase();
  if (VALID_LANGUAGES.has(normalized)) {
    return normalized;
  }

  return "en";
}

export async function saveAssistantInteraction({
  requestData,
  responseData,
  durationMs
}) {
  if (!readTrackingEnabled()) {
    return null;
  }

  const timestamp = new Date().toISOString();
  const message = typeof requestData?.message === "string" ? requestData.message : "";
  const answer = typeof responseData?.answer === "string" ? responseData.answer : "";

  const result = await run(
    `
      INSERT INTO assistant_interactions (
        created_at,
        session_id,
        language,
        page_context,
        page_slug,
        message_hash,
        message_length,
        answer_length,
        page_intent,
        confidence,
        knowledge_site_status,
        knowledge_documents_status,
        recommended_event_slug,
        suggested_actions_json,
        related_links_json,
        response_time_ms,
        error_code
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      timestamp,
      trimString(requestData?.sessionId, MAX_SESSION_ID_LENGTH),
      normalizeLanguage(requestData?.language),
      trimString(requestData?.pageContext, 32),
      trimString(requestData?.pageSlug, MAX_PAGE_SLUG_LENGTH),
      hashMessage(message),
      message.length,
      answer.length,
      trimString(responseData?.pageIntent, 48) || "guidance",
      typeof responseData?.confidence === "number" ? responseData.confidence : null,
      trimString(responseData?.knowledgeStatus?.site, 20) || "ok",
      trimString(responseData?.knowledgeStatus?.documents, 20) || "empty",
      trimString(responseData?.recommendedEventSlug, MAX_PAGE_SLUG_LENGTH),
      safeJsonStringify(responseData?.suggestedActions),
      safeJsonStringify(responseData?.relatedLinks),
      Number.isFinite(durationMs) ? Math.max(0, Math.round(durationMs)) : null,
      null
    ]
  );

  return result.lastID || null;
}

export function validateAssistantClickPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      success: false,
      error: "Request body must be a JSON object"
    };
  }

  const source = trimString(payload.source, 24);
  if (!source || !VALID_SOURCES.has(source)) {
    return {
      success: false,
      error: "source must be one of: hero, widget"
    };
  }

  const clickType = trimString(payload.clickType, 32);
  if (!clickType || !VALID_CLICK_TYPES.has(clickType)) {
    return {
      success: false,
      error:
        "clickType must be one of: quick-action, suggested-action, related-link, recommended-event"
    };
  }

  const label = trimString(payload.label, MAX_LABEL_LENGTH);
  if (!label) {
    return {
      success: false,
      error: "label is required"
    };
  }

  const target = trimString(payload.target, MAX_TARGET_LENGTH);
  if (!target) {
    return {
      success: false,
      error: "target is required"
    };
  }

  if (!target.startsWith("/") && !/^https?:\/\//i.test(target)) {
    return {
      success: false,
      error: "target must be an internal route or an external URL"
    };
  }

  const language = normalizeLanguage(payload.language);
  if (payload.language !== undefined && payload.language !== null) {
    const rawLanguage = String(payload.language).trim().toLowerCase();
    if (!VALID_LANGUAGES.has(rawLanguage)) {
      return {
        success: false,
        error: "language must be one of: en, es, de"
      };
    }
  }

  const pageContext = trimString(payload.pageContext, 32);
  if (pageContext && !VALID_PAGE_CONTEXTS.has(pageContext)) {
    return {
      success: false,
      error:
        "pageContext must be one of: home, events, event-detail, about, book, contact, host-event"
    };
  }

  const pageSlug = trimString(payload.pageSlug, MAX_PAGE_SLUG_LENGTH);
  if (pageSlug && !SLUG_PATTERN.test(pageSlug)) {
    return {
      success: false,
      error: "pageSlug has an invalid format"
    };
  }

  let interactionId = null;
  if (payload.interactionId !== undefined && payload.interactionId !== null) {
    interactionId = Number(payload.interactionId);
    if (!Number.isInteger(interactionId) || interactionId <= 0) {
      return {
        success: false,
        error: "interactionId must be a positive integer when provided"
      };
    }
  }

  return {
    success: true,
    data: {
      interactionId,
      source,
      clickType,
      label,
      target,
      actionType: trimString(payload.actionType, 40),
      sessionId: trimString(payload.sessionId, MAX_SESSION_ID_LENGTH),
      language,
      pageContext,
      pageSlug,
      pageIntent: trimString(payload.pageIntent, 48),
      recommendedEventSlug: trimString(payload.recommendedEventSlug, MAX_PAGE_SLUG_LENGTH)
    }
  };
}

export async function saveAssistantClick(data) {
  if (!readTrackingEnabled()) {
    return null;
  }

  const timestamp = new Date().toISOString();
  const result = await run(
    `
      INSERT INTO assistant_clicks (
        created_at,
        interaction_id,
        session_id,
        language,
        page_context,
        page_slug,
        source,
        click_type,
        action_type,
        label,
        target,
        page_intent,
        recommended_event_slug
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      timestamp,
      data.interactionId,
      data.sessionId,
      data.language,
      data.pageContext,
      data.pageSlug,
      data.source,
      data.clickType,
      data.actionType,
      data.label,
      data.target,
      data.pageIntent,
      data.recommendedEventSlug
    ]
  );

  return result.lastID || null;
}

function parseQueryInteger(value, fallback, min, max) {
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, Math.floor(next)));
}

export function parseAssistantInsightsQuery(query) {
  return {
    days: parseQueryInteger(query?.days, 30, 1, 180),
    limit: parseQueryInteger(query?.limit, 200, 20, 1000)
  };
}

export async function fetchAssistantInsights({ days, limit }) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const [interactionRows, clickRows] = await Promise.all([
    all(
      `
        SELECT *
        FROM assistant_interactions
        WHERE created_at >= ?
        ORDER BY id DESC
        LIMIT ?
      `,
      [since, limit]
    ),
    all(
      `
        SELECT *
        FROM assistant_clicks
        WHERE created_at >= ?
        ORDER BY id DESC
        LIMIT ?
      `,
      [since, limit]
    )
  ]);

  const suggestions = [];
  for (const row of interactionRows) {
    for (const item of parseJsonArray(row.suggested_actions_json)) {
      if (item && typeof item === "object" && typeof item.target === "string") {
        suggestions.push(item.target);
      }
    }
  }

  const suggestionCounts = countBy(suggestions, (target) => target)
    .slice(0, 12)
    .map((item) => ({ target: item.key, count: item.count }));

  const topRecommendedEvents = countBy(interactionRows, (row) => row.recommended_event_slug)
    .slice(0, 10)
    .map((item) => ({ slug: item.key, count: item.count }));

  const topClickedTargets = countBy(clickRows, (row) => row.target)
    .slice(0, 12)
    .map((item) => ({ target: item.key, count: item.count }));

  const interactionByIntent = countBy(interactionRows, (row) => row.page_intent).map(
    (item) => ({
      intent: item.key,
      count: item.count
    })
  );

  const interactionByLanguage = countBy(interactionRows, (row) => row.language).map(
    (item) => ({
      language: item.key,
      count: item.count
    })
  );

  const interactionByPage = countBy(interactionRows, (row) => row.page_context).map(
    (item) => ({
      pageContext: item.key,
      count: item.count
    })
  );

  const clickByType = countBy(clickRows, (row) => row.click_type).map((item) => ({
    clickType: item.key,
    count: item.count
  }));

  const toBookSuggested = suggestions.filter((target) => target.includes("/mi-libro")).length;
  const toContactSuggested = suggestions.filter((target) => target.includes("/contact")).length;
  const toBookClicked = clickRows.filter((row) => String(row.target).includes("/mi-libro")).length;
  const toContactClicked = clickRows.filter((row) =>
    String(row.target).includes("/contact")
  ).length;

  return {
    periodDays: days,
    sampleSize: {
      interactions: interactionRows.length,
      clicks: clickRows.length
    },
    interactions: {
      total: interactionRows.length,
      byIntent: interactionByIntent,
      byLanguage: interactionByLanguage,
      byPageContext: interactionByPage
    },
    suggestions: {
      topTargets: suggestionCounts,
      toBook: toBookSuggested,
      toContact: toContactSuggested
    },
    clicks: {
      total: clickRows.length,
      byType: clickByType,
      topTargets: topClickedTargets,
      toBook: toBookClicked,
      toContact: toContactClicked
    },
    recommendations: {
      topEvents: topRecommendedEvents
    },
    recent: {
      interactions: interactionRows.slice(0, 20).map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        language: row.language,
        pageContext: row.page_context,
        pageSlug: row.page_slug,
        pageIntent: row.page_intent,
        confidence: row.confidence,
        knowledgeStatus: {
          site: row.knowledge_site_status,
          documents: row.knowledge_documents_status
        },
        recommendedEventSlug: row.recommended_event_slug
      })),
      clicks: clickRows.slice(0, 20).map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        source: row.source,
        clickType: row.click_type,
        target: row.target,
        language: row.language,
        pageContext: row.page_context,
        pageIntent: row.page_intent
      }))
    }
  };
}
