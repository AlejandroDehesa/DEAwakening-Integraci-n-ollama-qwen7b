const VALID_PAGE_INTENTS = [
  "general_info",
  "event_discovery",
  "book_interest",
  "contact_interest",
  "about_david",
  "guidance"
];

const VALID_ACTION_TYPES = ["route", "event", "contact", "book", "external"];

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

function compactKnowledge(knowledge) {
  const sections = Object.fromEntries(
    Object.entries(knowledge.content || {}).map(([sectionKey, section]) => [
      sectionKey,
      {
        title: trimText(section.title, 220),
        subtitle: trimText(section.subtitle, 220),
        body: trimText(section.body, 900)
      }
    ])
  );

  const events = (knowledge.events?.upcoming || []).map((eventItem) => ({
    slug: eventItem.slug,
    title: trimText(eventItem.title, 160),
    date: eventItem.date,
    location: trimText(eventItem.location, 160),
    description: trimText(eventItem.description, 300)
  }));

  return {
    language: knowledge.language,
    navigation: knowledge.navigation,
    sections,
    events: {
      total: knowledge.events?.total || events.length,
      upcoming: events
    },
    contact: knowledge.contact,
    page: knowledge.page
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

function clampConfidence(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0.72;
  }

  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

export function buildAssistantMessages({
  language,
  message,
  sessionId,
  pageContext,
  pageSlug,
  knowledge
}) {
  const compact = compactKnowledge(knowledge);

  const systemPrompt = `
You are the DEAwakening website guide assistant.
Tone: warm, clear, premium, human and orienting.
Rules:
- Always reply in: ${language}.
- Use only facts present in the provided knowledge.
- Never invent events, dates, prices, addresses or claims.
- If information is missing, say so clearly and redirect to a real page or contact.
- Keep answers concise: 2 to 5 short sentences.
- Behave as a site guide, not as a therapist or medical advisor.

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
    knowledge: compact
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
    : Array.isArray(parsed.suggestedCtas)
      ? parsed.suggestedCtas
      : [];

  const suggestedActions = rawActions
    .map((action) =>
      normalizeAction(action, {
        language,
        availableEventSlugs
      })
    )
    .filter(Boolean);

  const rawRelated = Array.isArray(parsed.relatedLinks) ? parsed.relatedLinks : [];
  const relatedFromModel = rawRelated
    .map(normalizeRelatedLink)
    .filter(Boolean);

  const relatedFromActions = suggestedActions.map((action) => ({
    label: action.label,
    target: action.target
  }));

  const relatedLinks = dedupeByTarget([...relatedFromModel, ...relatedFromActions]);

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
    const eventAction = suggestedActions.find((action) => action.type === "event");
    if (eventAction?.target) {
      const match = eventAction.target.match(/^\/events\/([a-z0-9-]+)$/i);
      if (match && availableEventSlugs.includes(match[1])) {
        recommendedEventSlug = match[1];
      }
    }
  }

  return {
    answer,
    pageIntent,
    confidence,
    suggestedActions,
    relatedLinks,
    intent: pageIntent,
    suggestedCtas: suggestedActions,
    recommendedEventSlug
  };
}
