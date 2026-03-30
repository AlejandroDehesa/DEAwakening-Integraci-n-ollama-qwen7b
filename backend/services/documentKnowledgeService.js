import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_DOCUMENTS_DIR = path.join(__dirname, "..", "knowledge", "documents");
const SUPPORTED_EXTENSIONS = new Set([".md", ".txt", ".json"]);

let cachedDocuments = null;
let cachedFingerprint = null;

function normalizeLanguage(value) {
  if (typeof value !== "string") {
    return "en";
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "es" || normalized === "de" || normalized === "en") {
    return normalized;
  }

  return "en";
}

function toArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
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

function parseDocumentFromJson(fileName, rawContent) {
  const parsed = JSON.parse(rawContent);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const content = typeof parsed.content === "string" ? parsed.content.trim() : "";
  if (!content) {
    return null;
  }

  return {
    id: parsed.id || fileName.replace(/\.[^.]+$/, ""),
    title: parsed.title || fileName,
    language: normalizeLanguage(parsed.language),
    tags: toArray(parsed.tags),
    pageContexts: toArray(parsed.pageContexts),
    content
  };
}

function parseDocumentFromText(fileName, rawContent) {
  const parsed = parseFrontMatter(rawContent);
  const content = parsed.body.trim();
  if (!content) {
    return null;
  }

  return {
    id: parsed.meta.id || fileName.replace(/\.[^.]+$/, ""),
    title: parsed.meta.title || fileName,
    language: normalizeLanguage(parsed.meta.language),
    tags: toArray(parsed.meta.tags),
    pageContexts: toArray(parsed.meta.pageContexts),
    content
  };
}

async function scanDocumentsFolder(documentsDir) {
  let entries;
  try {
    entries = await fs.readdir(documentsDir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {
        files: [],
        fingerprint: "missing-folder"
      };
    }

    throw error;
  }

  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => ({
      name: entry.name,
      fullPath: path.join(documentsDir, entry.name),
      ext: path.extname(entry.name).toLowerCase()
    }))
    .filter((file) => SUPPORTED_EXTENSIONS.has(file.ext))
    .sort((a, b) => a.name.localeCompare(b.name));

  const statParts = [];
  for (const file of files) {
    const stat = await fs.stat(file.fullPath);
    statParts.push(`${file.name}:${stat.mtimeMs}:${stat.size}`);
  }

  return {
    files,
    fingerprint: statParts.join("|")
  };
}

async function parseDocumentFile(file) {
  const rawContent = await fs.readFile(file.fullPath, "utf8");

  if (file.ext === ".json") {
    return parseDocumentFromJson(file.name, rawContent);
  }

  return parseDocumentFromText(file.name, rawContent);
}

export async function loadDocumentKnowledge() {
  const documentsDir = process.env.ASSISTANT_DOCUMENTS_DIR || DEFAULT_DOCUMENTS_DIR;
  const scanned = await scanDocumentsFolder(documentsDir);

  if (cachedDocuments && cachedFingerprint === scanned.fingerprint) {
    return {
      status: "ok",
      source: documentsDir,
      documents: cachedDocuments
    };
  }

  const documents = [];
  for (const file of scanned.files) {
    const parsed = await parseDocumentFile(file);
    if (parsed) {
      documents.push(parsed);
    }
  }

  cachedDocuments = documents;
  cachedFingerprint = scanned.fingerprint;

  return {
    status: scanned.files.length > 0 ? "ok" : "empty",
    source: documentsDir,
    documents
  };
}
