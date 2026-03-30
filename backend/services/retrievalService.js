const MAX_SNIPPET_LENGTH = 620;

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "about",
  "what",
  "when",
  "where",
  "como",
  "para",
  "con",
  "que",
  "una",
  "las",
  "los",
  "del",
  "por",
  "uber",
  "und",
  "mit",
  "auf",
  "wie",
  "was",
  "der",
  "die",
  "das"
]);

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(" ")
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function buildTermSet(query, pageContext) {
  const terms = new Set(tokenize(query));
  for (const token of tokenize(pageContext || "")) {
    terms.add(token);
  }

  return terms;
}

function extractExcerpt(content, terms) {
  if (typeof content !== "string") {
    return "";
  }

  const cleanContent = content.replace(/\s+/g, " ").trim();
  if (!cleanContent) {
    return "";
  }

  if (terms.size === 0) {
    return cleanContent.slice(0, MAX_SNIPPET_LENGTH);
  }

  const lower = normalizeText(cleanContent);
  let bestIndex = -1;

  for (const term of terms) {
    const index = lower.indexOf(term);
    if (index !== -1 && (bestIndex === -1 || index < bestIndex)) {
      bestIndex = index;
    }
  }

  if (bestIndex === -1) {
    return cleanContent.slice(0, MAX_SNIPPET_LENGTH);
  }

  const start = Math.max(0, bestIndex - 110);
  const end = Math.min(cleanContent.length, bestIndex + MAX_SNIPPET_LENGTH - 40);
  const excerpt = cleanContent.slice(start, end).trim();
  return start > 0 ? `...${excerpt}` : excerpt;
}

function scoreDocument(doc, terms, language, pageContext) {
  const content = normalizeText(doc.content);
  if (!content) {
    return 0;
  }

  let score = 0;
  for (const term of terms) {
    if (content.includes(term)) {
      score += 2.4;
    }
  }

  const title = normalizeText(doc.title);
  for (const term of terms) {
    if (title.includes(term)) {
      score += 1.8;
    }
  }

  for (const tag of doc.tags || []) {
    const normalizedTag = normalizeText(tag);
    for (const term of terms) {
      if (normalizedTag.includes(term)) {
        score += 1;
      }
    }
  }

  if (doc.language === language) {
    score += 1.6;
  } else if (doc.language === "en") {
    score += 0.5;
  }

  if (pageContext && Array.isArray(doc.pageContexts) && doc.pageContexts.includes(pageContext)) {
    score += 1.3;
  }

  return score;
}

export function retrieveDocumentSnippets({
  documents,
  query,
  language,
  pageContext,
  maxSnippets = 4
}) {
  const safeDocuments = Array.isArray(documents) ? documents : [];
  const terms = buildTermSet(query, pageContext);

  const ranked = safeDocuments
    .map((doc) => ({
      doc,
      score: scoreDocument(doc, terms, language, pageContext)
    }))
    .filter((item) => item.score > 1.4)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSnippets);

  return ranked.map((item) => ({
    id: item.doc.id,
    title: item.doc.title,
    language: item.doc.language,
    relevance: Number(item.score.toFixed(2)),
    excerpt: extractExcerpt(item.doc.content, terms)
  }));
}
