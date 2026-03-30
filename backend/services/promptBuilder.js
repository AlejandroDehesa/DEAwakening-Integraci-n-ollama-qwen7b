const VALID_INTENTS = [
  "general_info",
  "event_discovery",
  "book_interest",
  "contact_interest",
  "about_david",
  "guidance"
];

const VALID_CTA_TYPES = ["route", "event", "contact", "book"];

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
    Object.entries(knowledge.sections || {}).map(([sectionKey, section]) => [
      sectionKey,
      {
        title: section.title,
        subtitle: section.subtitle,
        body: trimText(section.body, 800)
      }
    ])
  );

  const events = (knowledge.events || []).map((eventItem) => ({
    slug: eventItem.slug,
    title: eventItem.title,
    date: eventItem.date,
    location: eventItem.location,
    description: trimText(eventItem.description, 320)
  }));

  return {
    sections,
    events,
    pageContext: knowledge.pageContext,
    pageSlug: knowledge.pageSlug,
    eventContext: knowledge.eventContext,
    contact: knowledge.contact
  };
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
You are the DEAwakening assistant.
Style: warm, clear, premium, human and guiding.
Rules:
- Reply ONLY in the requested language: ${language}.
- Use ONLY the provided knowledge JSON.
- Do not invent facts, dates, events, prices, addresses or claims.
- If data is missing, state that clearly and suggest a real CTA (events page or contact).
- Keep responses concise and actionable.
- recommendedEventSlug must be one of: ${(knowledge.availableEventSlugs || []).join(", ") || "none"}.

Return ONLY valid JSON with this exact shape:
{
  "answer": "string",
  "intent": "general_info|event_discovery|book_interest|contact_interest|about_david|guidance",
  "suggestedCtas": [
    { "type": "route|event|contact|book", "label": "string", "target": "string" }
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

export function parseAssistantOutput(rawText, availableEventSlugs = []) {
  const parsed = parseJsonContent(rawText);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Model response is not valid JSON");
  }

  const answer = typeof parsed.answer === "string" ? parsed.answer.trim() : "";
  if (!answer) {
    throw new Error("Model response is missing a valid answer");
  }

  if (!VALID_INTENTS.includes(parsed.intent)) {
    throw new Error("Model response contains an invalid intent");
  }

  const rawCtas = Array.isArray(parsed.suggestedCtas) ? parsed.suggestedCtas : [];
  const suggestedCtas = rawCtas.map((cta) => {
    if (!cta || typeof cta !== "object") {
      throw new Error("Model response contains an invalid CTA entry");
    }

    const type = typeof cta.type === "string" ? cta.type.trim() : "";
    const label = typeof cta.label === "string" ? cta.label.trim() : "";
    const target = typeof cta.target === "string" ? cta.target.trim() : "";

    if (!VALID_CTA_TYPES.includes(type) || !label || !target) {
      throw new Error("Model response contains a malformed CTA");
    }

    return { type, label, target };
  });

  let recommendedEventSlug = null;
  if (parsed.recommendedEventSlug !== null && parsed.recommendedEventSlug !== undefined) {
    if (typeof parsed.recommendedEventSlug !== "string") {
      throw new Error("Model response contains an invalid recommendedEventSlug");
    }

    const trimmedSlug = parsed.recommendedEventSlug.trim();
    if (!availableEventSlugs.includes(trimmedSlug)) {
      throw new Error("Model response recommended an unknown event slug");
    }

    recommendedEventSlug = trimmedSlug;
  }

  return {
    answer,
    intent: parsed.intent,
    suggestedCtas,
    recommendedEventSlug
  };
}
