const VALID_PAGE_INTENTS = [
  "general_info",
  "event_discovery",
  "book_interest",
  "contact_interest",
  "about_david",
  "guidance"
];

const VALID_ACTION_TYPES = ["route", "event", "contact", "book", "external"];

const FALLBACK_ACTIONS_BY_INTENT = {
  general_info: {
    type: "route",
    target: "/about",
    labelByLanguage: {
      en: "Learn about David",
      es: "Conocer a David",
      de: "Mehr uber David"
    }
  },
  event_discovery: {
    type: "route",
    target: "/events",
    labelByLanguage: {
      en: "Explore events",
      es: "Ver eventos",
      de: "Events ansehen"
    }
  },
  book_interest: {
    type: "book",
    target: "/mi-libro",
    labelByLanguage: {
      en: "Discover the book",
      es: "Descubrir el libro",
      de: "Zum Buch"
    }
  },
  contact_interest: {
    type: "contact",
    target: "/contact",
    labelByLanguage: {
      en: "Contact David",
      es: "Contactar con David",
      de: "David kontaktieren"
    }
  },
  about_david: {
    type: "route",
    target: "/about",
    labelByLanguage: {
      en: "Read David's approach",
      es: "Ver enfoque de David",
      de: "Davids Ansatz lesen"
    }
  },
  guidance: {
    type: "route",
    target: "/events",
    labelByLanguage: {
      en: "Start with events",
      es: "Empezar por eventos",
      de: "Mit Events starten"
    }
  }
};

function trimText(value, maxLength = 2400) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength)}...`;
}

function compactKnowledge(siteKnowledge) {
  const sections = Object.fromEntries(
    Object.entries(siteKnowledge.content || {}).map(([sectionKey, section]) => [
      sectionKey,
      {
        title: trimText(section.title, 220),
        subtitle: trimText(section.subtitle, 220),
        body: trimText(section.body, 900)
      }
    ])
  );

  const events = (siteKnowledge.events?.upcoming || []).map((eventItem) => ({
    slug: eventItem.slug,
    title: trimText(eventItem.title, 160),
    date: eventItem.date,
    location: trimText(eventItem.location, 160),
    description: trimText(eventItem.description, 300)
  }));

  return {
    language: siteKnowledge.language,
    navigation: siteKnowledge.navigation,
    sections,
    events: {
      total: siteKnowledge.events?.total || events.length,
      upcoming: events
    },
    contact: siteKnowledge.contact,
    page: siteKnowledge.page
  };
}

function compactDocumentKnowledge(documentKnowledge) {
  const snippets = Array.isArray(documentKnowledge?.snippets)
    ? documentKnowledge.snippets.slice(0, 4).map((snippet) => ({
        id: snippet.id,
        title: trimText(snippet.title, 140),
        language: snippet.language,
        sourcePath: trimText(snippet.sourcePath, 160),
        excerpt: trimText(snippet.excerpt, 520),
        relevance: snippet.relevance
      }))
    : [];

  return {
    status: documentKnowledge?.status || "empty",
    totalDocuments: Number.isInteger(documentKnowledge?.totalDocuments)
      ? documentKnowledge.totalDocuments
      : 0,
    warningCount: Number.isInteger(documentKnowledge?.warningCount)
      ? documentKnowledge.warningCount
      : 0,
    snippets
  };
}

function defaultLabel(type, language) {
  const labels = {
    route: {
      en: "Open page",
      es: "Abrir pagina",
      de: "Seite offnen"
    },
    event: {
      en: "View event",
      es: "Ver evento",
      de: "Event ansehen"
    },
    contact: {
      en: "Contact",
      es: "Contacto",
      de: "Kontakt"
    },
    book: {
      en: "My book",
      es: "Mi libro",
      de: "Mein Buch"
    },
    external: {
      en: "Open link",
      es: "Abrir enlace",
      de: "Link offnen"
    }
  };

  return labels[type]?.[language] || labels[type]?.en || "Open";
}

function normalizeEventTarget(target, availableEventSlugs = []) {
  if (typeof target !== "string") {
    return null;
  }

  const trimmed = target.trim();
  if (!trimmed) {
    return null;
  }

  if (availableEventSlugs.includes(trimmed)) {
    return `/events/${trimmed}`;
  }

  const match = trimmed.match(/^\/events\/([a-z0-9-]+)$/i);
  if (match && availableEventSlugs.includes(match[1])) {
    return trimmed;
  }

  return null;
}

function normalizeAction(rawAction, { language, availableEventSlugs }) {
  if (!rawAction || typeof rawAction !== "object") {
    return null;
  }

  const type = typeof rawAction.type === "string" ? rawAction.type.trim() : "";
  if (!VALID_ACTION_TYPES.includes(type)) {
    return null;
  }

  const rawLabel = typeof rawAction.label === "string" ? rawAction.label.trim() : "";
  const label = rawLabel || defaultLabel(type, language);

  const rawTarget =
    typeof rawAction.target === "string" ? rawAction.target.trim() : "";

  if (type === "route" || type === "contact" || type === "book") {
    const fallbackTarget =
      type === "contact" ? "/contact" : type === "book" ? "/mi-libro" : "/";
    const target = rawTarget.startsWith("/") ? rawTarget : fallbackTarget;
    return { type, label, target };
  }

  if (type === "event") {
    const eventTarget = normalizeEventTarget(rawTarget, availableEventSlugs);
    if (!eventTarget) {
      return null;
    }

    return { type, label, target: eventTarget };
  }

  if (type === "external") {
    if (!/^https?:\/\//i.test(rawTarget)) {
      return null;
    }

    return { type, label, target: rawTarget };
  }

  return null;
}

function normalizeRelatedLink(rawLink) {
  if (!rawLink || typeof rawLink !== "object") {
    return null;
  }

  const label = typeof rawLink.label === "string" ? rawLink.label.trim() : "";
  const target = typeof rawLink.target === "string" ? rawLink.target.trim() : "";

  if (!label || !target) {
    return null;
  }

  if (!target.startsWith("/") && !/^https?:\/\//i.test(target)) {
    return null;
  }

  return { label, target };
}

function dedupeByTarget(items) {
  const map = new Map();

  for (const item of items) {
    if (!item?.target) {
      continue;
    }

    if (!map.has(item.target)) {
      map.set(item.target, item);
    }
  }

  return Array.from(map.values());
}

function dedupeActionsByTypeAndTarget(items) {
  const map = new Map();

  for (const item of items) {
    if (!item?.type || !item?.target) {
      continue;
    }

    const key = `${item.type}:${item.target}`;
    if (!map.has(key)) {
      map.set(key, item);
    }
  }

  return Array.from(map.values());
}

function clampConfidence(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0.72;
  }

  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function fallbackActionByIntent(intent, language) {
  const fallback = FALLBACK_ACTIONS_BY_INTENT[intent];
  if (!fallback) {
    return null;
  }

  return {
    type: fallback.type,
    target: fallback.target,
    label: fallback.labelByLanguage[language] || fallback.labelByLanguage.en
  };
}

function ensureActionCoverage({
  actions,
  relatedLinks,
  pageIntent,
  language,
  recommendedEventSlug
}) {
  const nextActions = dedupeActionsByTypeAndTarget(Array.isArray(actions) ? [...actions] : []);
  const nextRelated = Array.isArray(relatedLinks) ? [...relatedLinks] : [];

  const fallbackAction = fallbackActionByIntent(pageIntent, language);
  if (nextActions.length === 0 && fallbackAction) {
    nextActions.push(fallbackAction);
  }

  if (recommendedEventSlug) {
    const eventTarget = `/events/${recommendedEventSlug}`;
    const hasEventAction = nextActions.some((action) => action.target === eventTarget);
    if (!hasEventAction) {
      nextActions.unshift({
        type: "event",
        label:
          language === "es"
            ? "Ver evento recomendado"
            : language === "de"
              ? "Empfohlenes Event ansehen"
              : "View recommended event",
        target: eventTarget
      });
    }
  }

  const actionTargets = new Set(nextActions.map((action) => action.target));
  const filteredRelated = dedupeByTarget(nextRelated).filter(
    (link) => !actionTargets.has(link.target)
  );

  return {
    actions: nextActions,
    relatedLinks: filteredRelated
  };
}

function resolveRecommendedEventSlug(parsed, availableEventSlugs, actions) {
  let recommendedEventSlug = null;

  if (parsed.recommendedEventSlug !== null && parsed.recommendedEventSlug !== undefined) {
    if (typeof parsed.recommendedEventSlug === "string") {
      const trimmedSlug = parsed.recommendedEventSlug.trim();
      if (availableEventSlugs.includes(trimmedSlug)) {
        recommendedEventSlug = trimmedSlug;
      }
    }
  }

  if (!recommendedEventSlug) {
    const eventAction = actions.find((action) => action.type === "event");
    if (eventAction?.target) {
      const match = eventAction.target.match(/^\/events\/([a-z0-9-]+)$/i);
      if (match && availableEventSlugs.includes(match[1])) {
        recommendedEventSlug = match[1];
      }
    }
  }

  return recommendedEventSlug;
}

export function buildAssistantMessages({
  language,
  message,
  sessionId,
  pageContext,
  pageSlug,
  siteKnowledge,
  documentKnowledge
}) {
  const compactSite = compactKnowledge(siteKnowledge);
  const compactDocs = compactDocumentKnowledge(documentKnowledge);

  const systemPrompt = `
You are the DEAwakening website guide assistant.
Tone: warm, clear, premium, human, and orienting.

Core rules:
- Always reply in ${language}.
- Use only facts present in SITE_KNOWLEDGE and DOCUMENT_KNOWLEDGE snippets.
- Never invent events, dates, prices, addresses, medical claims, or unavailable offers.
- Never claim personal preferences (for example: "my favorite event").
- If information is missing, say it clearly and guide the user to a real page or contact.
- Keep answers concise and useful: 2-6 short sentences.
- Stay practical and conversion-oriented: explain and guide the next best step.
- Do not output Markdown lists unless needed for clarity.

Return ONLY valid JSON with this exact shape:
{
  "answer": "string",
  "pageIntent": "general_info|event_discovery|book_interest|contact_interest|about_david|guidance",
  "confidence": 0.0,
  "suggestedActions": [
    { "type": "route|event|contact|book|external", "label": "string", "target": "string" }
  ],
  "relatedLinks": [
    { "label": "string", "target": "string" }
  ],
  "recommendedEventSlug": "string|null"
}
`;

  const userPayload = {
    language,
    sessionId: sessionId || null,
    pageContext: pageContext || null,
    pageSlug: pageSlug || null,
    userMessage: message,
    siteKnowledge: compactSite,
    documentKnowledge: compactDocs
  };

  return [
    {
      role: "system",
      content: systemPrompt.trim()
    },
    {
      role: "user",
      content: JSON.stringify(userPayload)
    }
  ];
}

function parseJsonContent(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

export function parseAssistantOutput(
  rawText,
  { language = "en", availableEventSlugs = [] } = {}
) {
  const parsed = parseJsonContent(rawText);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Model response is not valid JSON");
  }

  const answer = typeof parsed.answer === "string" ? parsed.answer.trim() : "";
  if (!answer) {
    throw new Error("Model response is missing a valid answer");
  }

  const rawPageIntent =
    typeof parsed.pageIntent === "string"
      ? parsed.pageIntent.trim()
      : typeof parsed.intent === "string"
        ? parsed.intent.trim()
        : "";

  const pageIntent = VALID_PAGE_INTENTS.includes(rawPageIntent)
    ? rawPageIntent
    : "guidance";

  const confidence = clampConfidence(parsed.confidence);

  const rawActions = Array.isArray(parsed.suggestedActions)
    ? parsed.suggestedActions
    : [];

  const normalizedActions = rawActions
    .map((action) =>
      normalizeAction(action, {
        language,
        availableEventSlugs
      })
    )
    .filter(Boolean);

  const rawRelated = Array.isArray(parsed.relatedLinks) ? parsed.relatedLinks : [];
  const normalizedRelated = rawRelated
    .map(normalizeRelatedLink)
    .filter(Boolean);

  const recommendedEventSlug = resolveRecommendedEventSlug(
    parsed,
    availableEventSlugs,
    normalizedActions
  );

  const covered = ensureActionCoverage({
    actions: normalizedActions,
    relatedLinks: normalizedRelated,
    pageIntent,
    language,
    recommendedEventSlug
  });

  return {
    answer,
    pageIntent,
    confidence,
    suggestedActions: covered.actions,
    relatedLinks: covered.relatedLinks,
    recommendedEventSlug
  };
}
