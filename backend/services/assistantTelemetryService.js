import crypto from "crypto";
import { all, run } from "../database/database.js";

const MAX_SESSION_ID_LENGTH = 120;
const MAX_PAGE_SLUG_LENGTH = 180;
const MAX_LABEL_LENGTH = 140;
const MAX_TARGET_LENGTH = 320;
const MAX_TRACKED_SUGGESTED_ACTIONS = 6;
const MAX_TRACKED_RELATED_LINKS = 6;

const SLUG_PATTERN = /^[a-z0-9-]+$/i;
const QUICK_ACTION_TARGET_PATTERN = /^qa:[a-z0-9][a-z0-9-]{1,60}$/i;

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

function mapCountItems(countItems, keyName) {
  return countItems.map((item) => ({
    [keyName]: item.key,
    count: item.count
  }));
}

function normalizeLanguage(language) {
  if (typeof language !== "string") {
    return "en";
  }

  const normalized = language.trim().toLowerCase();
  return VALID_LANGUAGES.has(normalized) ? normalized : "en";
}

function readTrackingEnabled() {
  const value = (process.env.ASSISTANT_TRACKING_ENABLED || "true").toLowerCase();
  return value !== "false" && value !== "0";
}

function shouldForceTrackingError() {
  return String(process.env.ASSISTANT_FORCE_TRACKING_ERROR || "").toLowerCase() === "true";
}

function sanitizeTrackedActions(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  const normalized = [];
  const seen = new Set();

  for (const item of items) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const target = trimString(item.target, MAX_TARGET_LENGTH);
    if (!target) {
      continue;
    }

    const type = trimString(item.type, 32) || "route";
    const label = trimString(item.label, 90);
    const dedupeKey = `${type}|${target}`;
    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    normalized.push({
      type,
      target,
      label: label || target
    });

    if (normalized.length >= MAX_TRACKED_SUGGESTED_ACTIONS) {
      break;
    }
  }

  return normalized;
}

function sanitizeTrackedRelatedLinks(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  const normalized = [];
  const seen = new Set();

  for (const item of items) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const target = trimString(item.target, MAX_TARGET_LENGTH);
    const label = trimString(item.label, 90);
    if (!target || !label) {
      continue;
    }

    const dedupeKey = `${label}|${target}`;
    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    normalized.push({ label, target });
    if (normalized.length >= MAX_TRACKED_RELATED_LINKS) {
      break;
    }
  }

  return normalized;
}

function classifyTargetCategory(target) {
  const safeTarget = String(target || "");
  if (!safeTarget) {
    return "other";
  }

  if (safeTarget.startsWith("/events")) {
    return "events";
  }

  if (safeTarget.startsWith("/contact")) {
    return "contact";
  }

  if (safeTarget.startsWith("/mi-libro")) {
    return "book";
  }

  if (safeTarget.startsWith("qa:")) {
    return "quick-action";
  }

  if (/^https?:\/\//i.test(safeTarget)) {
    return "external";
  }

  return "other";
}

function buildConversionSummary(items) {
  const total = items.length;
  const byCategory = countBy(items, (item) => classifyTargetCategory(item.target));
  const counts = Object.fromEntries(byCategory.map((item) => [item.key, item.count]));

  return {
    total,
    toEvents: counts.events || 0,
    toContact: counts.contact || 0,
    toBook: counts.book || 0,
    toQuickActions: counts["quick-action"] || 0,
    toExternal: counts.external || 0,
    toOther: counts.other || 0
  };
}

function buildRate(numerator, denominator) {
  if (!denominator) {
    return 0;
  }

  return Number((numerator / denominator).toFixed(3));
}

export async function saveAssistantInteraction({ requestData, responseData, durationMs }) {
  if (!readTrackingEnabled()) {
    return null;
  }

  if (shouldForceTrackingError()) {
    throw new Error("forced_tracking_error");
  }

  const timestamp = new Date().toISOString();
  const message = typeof requestData?.message === "string" ? requestData.message : "";
  const answer = typeof responseData?.answer === "string" ? responseData.answer : "";
  const trackedSuggestedActions = sanitizeTrackedActions(responseData?.suggestedActions);
  const trackedRelatedLinks = sanitizeTrackedRelatedLinks(responseData?.relatedLinks);
  const confidence =
    typeof responseData?.confidence === "number" && Number.isFinite(responseData.confidence)
      ? Number(responseData.confidence.toFixed(2))
      : null;

  const result = await run(
    `
      INSERT INTO assistant_interactions (
        created_at,
        interaction_type,
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      timestamp,
      "assistant-response",
      trimString(requestData?.sessionId, MAX_SESSION_ID_LENGTH),
      normalizeLanguage(requestData?.language),
      trimString(requestData?.pageContext, 32),
      trimString(requestData?.pageSlug, MAX_PAGE_SLUG_LENGTH),
      hashMessage(message),
      message.length,
      answer.length,
      trimString(responseData?.pageIntent, 48) || "guidance",
      confidence,
      trimString(responseData?.knowledgeStatus?.site, 20) || "ok",
      trimString(responseData?.knowledgeStatus?.documents, 20) || "empty",
      trimString(responseData?.recommendedEventSlug, MAX_PAGE_SLUG_LENGTH),
      safeJsonStringify(trackedSuggestedActions),
      safeJsonStringify(trackedRelatedLinks),
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

  if (clickType === "quick-action") {
    if (!QUICK_ACTION_TARGET_PATTERN.test(target)) {
      return {
        success: false,
        error: "quick-action target must match qa:<id>"
      };
    }
  } else if (!target.startsWith("/") && !/^https?:\/\//i.test(target)) {
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

  if (shouldForceTrackingError()) {
    throw new Error("forced_tracking_error");
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

function parseQueryBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

export function parseAssistantInsightsQuery(query) {
  return {
    days: parseQueryInteger(query?.days, 30, 1, 180),
    limit: parseQueryInteger(query?.limit, 200, 20, 1000),
    includeRecent: parseQueryBoolean(query?.includeRecent, true)
  };
}

export async function fetchAssistantInsights({ days, limit, includeRecent }) {
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

  const suggestedActionItems = [];
  const relatedLinkItems = [];

  for (const row of interactionRows) {
    for (const action of parseJsonArray(row.suggested_actions_json)) {
      if (!action || typeof action !== "object" || typeof action.target !== "string") {
        continue;
      }

      suggestedActionItems.push({
        type: typeof action.type === "string" ? action.type : "route",
        target: action.target
      });
    }

    for (const link of parseJsonArray(row.related_links_json)) {
      if (!link || typeof link !== "object" || typeof link.target !== "string") {
        continue;
      }

      relatedLinkItems.push({
        target: link.target
      });
    }
  }

  const interactionByIntent = mapCountItems(
    countBy(interactionRows, (row) => row.page_intent),
    "intent"
  );
  const interactionByLanguage = mapCountItems(
    countBy(interactionRows, (row) => row.language),
    "language"
  );
  const interactionByPage = mapCountItems(
    countBy(interactionRows, (row) => row.page_context || "unknown"),
    "pageContext"
  );
  const interactionByDocKnowledge = mapCountItems(
    countBy(interactionRows, (row) => row.knowledge_documents_status || "unknown"),
    "documentsStatus"
  );
  const interactionBySiteKnowledge = mapCountItems(
    countBy(interactionRows, (row) => row.knowledge_site_status || "unknown"),
    "siteStatus"
  );

  const suggestedByTarget = mapCountItems(
    countBy(suggestedActionItems, (item) => item.target).slice(0, 12),
    "target"
  );
  const suggestedByType = mapCountItems(
    countBy(suggestedActionItems, (item) => item.type).slice(0, 8),
    "type"
  );
  const relatedLinksByTarget = mapCountItems(
    countBy(relatedLinkItems, (item) => item.target).slice(0, 12),
    "target"
  );

  const clicksByTarget = mapCountItems(
    countBy(clickRows, (row) => row.target).slice(0, 12),
    "target"
  );
  const clicksByType = mapCountItems(
    countBy(clickRows, (row) => row.click_type).slice(0, 8),
    "clickType"
  );
  const clicksBySource = mapCountItems(
    countBy(clickRows, (row) => row.source).slice(0, 4),
    "source"
  );

  const topRecommendedEvents = mapCountItems(
    countBy(interactionRows, (row) => row.recommended_event_slug).slice(0, 10),
    "slug"
  );

  const suggestedConversion = buildConversionSummary(suggestedActionItems);
  const clickedConversion = buildConversionSummary(clickRows);

  const recommendationClicks = clickRows.filter(
    (row) => row.click_type === "recommended-event"
  ).length;
  const recommendationsTotal = interactionRows.filter(
    (row) => typeof row.recommended_event_slug === "string" && row.recommended_event_slug.trim()
  ).length;

  const clickCountByContext = new Map();
  for (const click of clickRows) {
    const key = click.page_context || "unknown";
    clickCountByContext.set(key, (clickCountByContext.get(key) || 0) + 1);
  }

  const pagePerformance = interactionByPage.map((entry) => {
    const clicks = clickCountByContext.get(entry.pageContext) || 0;
    return {
      pageContext: entry.pageContext,
      interactions: entry.count,
      clicks,
      clicksPerInteraction: buildRate(clicks, entry.count)
    };
  });

  const response = {
    contractVersion: "assistant-insights.v2",
    periodDays: days,
    sampleSize: {
      interactions: interactionRows.length,
      clicks: clickRows.length
    },
    overview: {
      totalInteractions: interactionRows.length,
      totalClicks: clickRows.length,
      clicksPerInteraction: buildRate(clickRows.length, interactionRows.length)
    },
    usage: {
      byIntent: interactionByIntent,
      byLanguage: interactionByLanguage,
      byPageContext: interactionByPage,
      byKnowledgeStatus: {
        documents: interactionByDocKnowledge,
        site: interactionBySiteKnowledge
      },
      pagePerformance
    },
    actions: {
      suggested: {
        topTargets: suggestedByTarget,
        byType: suggestedByType,
        relatedLinksTopTargets: relatedLinksByTarget
      },
      clicks: {
        topTargets: clicksByTarget,
        byType: clicksByType,
        bySource: clicksBySource
      }
    },
    conversion: {
      suggested: suggestedConversion,
      clicked: clickedConversion,
      rates: {
        events: buildRate(clickedConversion.toEvents, suggestedConversion.toEvents),
        contact: buildRate(clickedConversion.toContact, suggestedConversion.toContact),
        book: buildRate(clickedConversion.toBook, suggestedConversion.toBook)
      }
    },
    recommendations: {
      totalRecommended: recommendationsTotal,
      recommendedEventClicks: recommendationClicks,
      recommendationClickRate: buildRate(recommendationClicks, recommendationsTotal),
      topEvents: topRecommendedEvents
    },

    // Legacy shape kept for compatibility with existing consumers.
    interactions: {
      total: interactionRows.length,
      byIntent: interactionByIntent,
      byLanguage: interactionByLanguage,
      byPageContext: interactionByPage
    },
    suggestions: {
      topTargets: suggestedByTarget,
      toBook: suggestedConversion.toBook,
      toContact: suggestedConversion.toContact,
      toEvents: suggestedConversion.toEvents
    },
    clicks: {
      total: clickRows.length,
      byType: clicksByType,
      topTargets: clicksByTarget,
      toBook: clickedConversion.toBook,
      toContact: clickedConversion.toContact,
      toEvents: clickedConversion.toEvents
    }
  };

  if (includeRecent) {
    response.recent = {
      interactions: interactionRows.slice(0, 20).map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        interactionType: row.interaction_type,
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
    };
  }

  return response;
}
