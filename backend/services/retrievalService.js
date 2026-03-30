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
  "das",
  "ich",
  "you",
  "want"
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

function buildTermSet({ query, pageContext, pageSlug }) {
  const terms = new Set(tokenize(query));

  for (const token of tokenize(pageContext || "")) {
    terms.add(token);
  }

  if (typeof pageSlug === "string" && pageSlug.trim()) {
    for (const part of pageSlug.split("-")) {
      const token = normalizeText(part);
      if (token.length > 2) {
        terms.add(token);
      }
    }
  }

  return terms;
}

function countTermMatches(content, terms) {
  let matches = 0;
  for (const term of terms) {
    if (content.includes(term)) {
      matches += 1;
    }
  }

  return matches;
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
  let bestTermLength = 0;

  for (const term of terms) {
    const index = lower.indexOf(term);
    if (index === -1) {
      continue;
    }

    if (bestIndex === -1 || index < bestIndex || term.length > bestTermLength) {
      bestIndex = index;
      bestTermLength = term.length;
    }
  }

  if (bestIndex === -1) {
    return cleanContent.slice(0, MAX_SNIPPET_LENGTH);
  }

  const start = Math.max(0, bestIndex - 120);
  const end = Math.min(cleanContent.length, bestIndex + MAX_SNIPPET_LENGTH - 70);
  const excerpt = cleanContent.slice(start, end).trim();
  return start > 0 ? `...${excerpt}` : excerpt;
}

function scoreDocument({
  doc,
  terms,
  language,
  pageContext,
  pageSlug
}) {
  const normalizedContent = normalizeText(doc.content);
  if (!normalizedContent) {
    return 0;
  }

  const normalizedTitle = normalizeText(doc.title);
  const normalizedTags = Array.isArray(doc.tags)
    ? doc.tags.map((tag) => normalizeText(tag)).filter(Boolean)
    : [];

  const termMatchesInBody = countTermMatches(normalizedContent, terms);
  const termMatchesInTitle = countTermMatches(normalizedTitle, terms);
  const termMatchesInTags = normalizedTags.reduce(
    (count, tag) => count + countTermMatches(tag, terms),
    0
  );

  const termCoverage =
    terms.size > 0 ? (termMatchesInBody + termMatchesInTitle) / terms.size : 0;

  let score = 0;
  score += termMatchesInBody * 2.4;
  score += termMatchesInTitle * 2;
  score += termMatchesInTags * 1.2;
  score += termCoverage * 3;

  if (doc.language === language) {
    score += 2.4;
  } else if (doc.language === "en") {
    score += 0.8;
  } else {
    score -= 0.8;
  }

  if (pageContext && Array.isArray(doc.pageContexts) && doc.pageContexts.includes(pageContext)) {
    score += 1.8;
  }

  if (pageSlug && normalizedContent.includes(normalizeText(pageSlug).replace(/-/g, " "))) {
    score += 1.1;
  }

  if (terms.size > 0 && termMatchesInBody === 0 && termMatchesInTitle === 0) {
    score -= 1.6;
  }

  return Number(score.toFixed(2));
}

function dedupeSnippets(items) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    const excerptKey = normalizeText(item.excerpt).slice(0, 200);
    const key = `${item.id}:${item.language}:${excerptKey}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

export function retrieveDocumentSnippets({
  documents,
  query,
  language,
  pageContext,
  pageSlug,
  maxSnippets = 4
}) {
  const safeDocuments = Array.isArray(documents) ? documents : [];
  const terms = buildTermSet({
    query,
    pageContext,
    pageSlug
  });

  const ranked = safeDocuments
    .map((doc) => ({
      doc,
      score: scoreDocument({
        doc,
        terms,
        language,
        pageContext,
        pageSlug
      })
    }))
    .filter((item) => item.score > 1.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSnippets * 2)
    .map((item) => ({
      id: item.doc.id,
      title: item.doc.title,
      language: item.doc.language,
      relevance: item.score,
      sourcePath: item.doc.sourcePath,
      excerpt: extractExcerpt(item.doc.content, terms)
    }));

  return dedupeSnippets(ranked).slice(0, maxSnippets);
}
