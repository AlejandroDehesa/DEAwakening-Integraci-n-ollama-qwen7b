import { loadDocumentKnowledge } from "./documentKnowledgeService.js";
import { retrieveDocumentSnippets } from "./retrievalService.js";
import { fetchSiteKnowledge } from "./siteKnowledgeService.js";

function sanitizeErrorMessage(error) {
  if (!error) {
    return "unknown_error";
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message.trim().slice(0, 140);
  }

  return "unknown_error";
}

export async function buildAssistantKnowledge({
  language,
  pageContext,
  pageSlug,
  message
}) {
  const siteKnowledge = await fetchSiteKnowledge({
    language,
    pageContext,
    pageSlug
  });

  let documentKnowledge = {
    status: "empty",
    source: null,
    totalDocuments: 0,
    snippets: []
  };

  try {
    const documentSource = await loadDocumentKnowledge();
    const documents = Array.isArray(documentSource.documents)
      ? documentSource.documents
      : [];

    const snippets = retrieveDocumentSnippets({
      documents,
      query: message,
      language,
      pageContext
    });

    documentKnowledge = {
      status: documentSource.status,
      source: documentSource.source,
      totalDocuments: documents.length,
      snippets
    };
  } catch (error) {
    const reason = sanitizeErrorMessage(error);
    console.warn(`[assistant] document_knowledge_unavailable reason="${reason}"`);
    documentKnowledge = {
      status: "unavailable",
      source: null,
      totalDocuments: 0,
      snippets: [],
      error: reason
    };
  }

  return {
    siteKnowledge,
    documentKnowledge,
    availableEventSlugs: siteKnowledge.availableEventSlugs || []
  };
}
