import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_DOCUMENTS_DIR = path.join(__dirname, "..", "knowledge", "documents");
const SUPPORTED_EXTENSIONS = new Set([".md", ".txt", ".json"]);
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

let cachedDocuments = null;
let cachedMetadata = null;
let cachedFingerprint = null;

function normalizeLanguage(value) {
  if (typeof value !== "string") {
    return "en";
  }

  const normalized = value.trim().toLowerCase();
  return VALID_LANGUAGES.has(normalized) ? normalized : "en";
}

function splitToArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,;|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeTags(value) {
  return Array.from(
    new Set(
      splitToArray(value)
        .map((item) => item.toLowerCase())
        .filter(Boolean)
    )
  );
}

function normalizePageContexts(value) {
  const items = splitToArray(value).map((item) => item.toLowerCase());
  return Array.from(new Set(items.filter((item) => VALID_PAGE_CONTEXTS.has(item))));
}

function parseFrontMatter(rawContent) {
  if (!rawContent.startsWith("---\n")) {
    return {
      meta: {},
      body: rawContent
    };
  }

  const endIndex = rawContent.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return {
      meta: {},
      body: rawContent
    };
  }

  const frontMatterRaw = rawContent.slice(4, endIndex);
  const body = rawContent.slice(endIndex + 5);
  const meta = {};

  for (const line of frontMatterRaw.split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (!key) {
      continue;
    }

    meta[key] = value;
  }

  return {
    meta,
    body
  };
}

function normalizeContent(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

function createDocumentRecord({
  fileName,
  sourcePath,
  id,
  title,
  language,
  tags,
  pageContexts,
  content
}) {
  const normalizedContent = normalizeContent(content);
  if (normalizedContent.length < 40) {
    return null;
  }

  const normalizedId = String(id || fileName.replace(/\.[^.]+$/, ""))
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-");

  const normalizedTitle = String(title || fileName).trim();

  return {
    id: normalizedId || fileName.replace(/\.[^.]+$/, ""),
    title: normalizedTitle || fileName,
    language: normalizeLanguage(language),
    tags: normalizeTags(tags),
    pageContexts: normalizePageContexts(pageContexts),
    content: normalizedContent,
    contentLength: normalizedContent.length,
    sourcePath
  };
}

function parseDocumentFromJson(file, rawContent) {
  const parsed = JSON.parse(rawContent);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  return createDocumentRecord({
    fileName: file.name,
    sourcePath: file.relativePath,
    id: parsed.id,
    title: parsed.title,
    language: parsed.language,
    tags: parsed.tags,
    pageContexts: parsed.pageContexts,
    content: parsed.content
  });
}

function parseDocumentFromText(file, rawContent) {
  const parsed = parseFrontMatter(rawContent);

  return createDocumentRecord({
    fileName: file.name,
    sourcePath: file.relativePath,
    id: parsed.meta.id,
    title: parsed.meta.title,
    language: parsed.meta.language,
    tags: parsed.meta.tags,
    pageContexts: parsed.meta.pageContexts,
    content: parsed.body
  });
}

async function listFilesRecursive(baseDir, currentDir = baseDir) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      const nested = await listFilesRecursive(baseDir, absolutePath);
      files.push(...nested);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      continue;
    }

    files.push({
      name: entry.name,
      ext,
      fullPath: absolutePath,
      relativePath: path.relative(baseDir, absolutePath).replace(/\\/g, "/")
    });
  }

  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

async function scanDocumentsFolder(documentsDir) {
  try {
    const files = await listFilesRecursive(documentsDir);
    const statParts = [];

    for (const file of files) {
      const stat = await fs.stat(file.fullPath);
      statParts.push(`${file.relativePath}:${stat.mtimeMs}:${stat.size}`);
    }

    return {
      files,
      fingerprint: statParts.join("|")
    };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {
        files: [],
        fingerprint: "missing-folder"
      };
    }

    throw error;
  }
}

async function parseDocumentFile(file) {
  const rawContent = await fs.readFile(file.fullPath, "utf8");
  if (file.ext === ".json") {
    return parseDocumentFromJson(file, rawContent);
  }

  return parseDocumentFromText(file, rawContent);
}

function dedupeDocuments(documents, warnings) {
  const map = new Map();

  for (const doc of documents) {
    const key = `${doc.language}:${doc.id}`;
    const existing = map.get(key);

    if (!existing) {
      map.set(key, doc);
      continue;
    }

    const keepCurrent = doc.contentLength > existing.contentLength;
    map.set(key, keepCurrent ? doc : existing);
    warnings.push(
      `Duplicate id "${doc.id}" for language "${doc.language}". Kept ${keepCurrent ? doc.sourcePath : existing.sourcePath}.`
    );
  }

  return Array.from(map.values());
}

function buildMetadata(documents, warnings) {
  const byLanguage = documents.reduce((accumulator, doc) => {
    accumulator[doc.language] = (accumulator[doc.language] || 0) + 1;
    return accumulator;
  }, {});

  return {
    warnings,
    totalDocuments: documents.length,
    byLanguage
  };
}

export async function loadDocumentKnowledge() {
  const documentsDir = process.env.ASSISTANT_DOCUMENTS_DIR || DEFAULT_DOCUMENTS_DIR;
  const scanned = await scanDocumentsFolder(documentsDir);

  if (cachedDocuments && cachedMetadata && cachedFingerprint === scanned.fingerprint) {
    return {
      status: cachedDocuments.length > 0 ? "ok" : "empty",
      source: documentsDir,
      documents: cachedDocuments,
      metadata: cachedMetadata
    };
  }

  const warnings = [];
  const parsedDocuments = [];

  for (const file of scanned.files) {
    try {
      const parsed = await parseDocumentFile(file);
      if (parsed) {
        parsedDocuments.push(parsed);
      } else {
        warnings.push(`Skipped "${file.relativePath}" because content is too short.`);
      }
    } catch (error) {
      warnings.push(`Skipped "${file.relativePath}" due to parse error: ${error.message}`);
    }
  }

  const deduped = dedupeDocuments(parsedDocuments, warnings);
  const metadata = buildMetadata(deduped, warnings);

  cachedDocuments = deduped;
  cachedMetadata = metadata;
  cachedFingerprint = scanned.fingerprint;

  return {
    status: deduped.length > 0 ? "ok" : "empty",
    source: documentsDir,
    documents: deduped,
    metadata
  };
}
