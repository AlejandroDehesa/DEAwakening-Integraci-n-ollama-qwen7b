import { loadDocumentKnowledge } from "../services/documentKnowledgeService.js";
import { retrieveDocumentSnippets } from "../services/retrievalService.js";

const PREVIEW_QUERIES = [
  {
    language: "es",
    pageContext: "book",
    query: "Quiero saber de que trata el libro de David"
  },
  {
    language: "en",
    pageContext: "events",
    query: "How does group DEA work and which event should I start with?"
  },
  {
    language: "de",
    pageContext: "home",
    query: "Ich mochte den Ansatz von DEAwakening besser verstehen"
  }
];

function printHeader(title) {
  console.log(`\n=== ${title} ===`);
}

async function run() {
  const loaded = await loadDocumentKnowledge();
  printHeader("Document source");
  console.log(`status: ${loaded.status}`);
  console.log(`source: ${loaded.source}`);
  console.log(`documents: ${loaded.documents.length}`);

  for (const preview of PREVIEW_QUERIES) {
    const snippets = retrieveDocumentSnippets({
      documents: loaded.documents,
      query: preview.query,
      language: preview.language,
      pageContext: preview.pageContext
    });

    printHeader(`${preview.language.toUpperCase()} / ${preview.pageContext}`);
    console.log(`query: ${preview.query}`);
    if (snippets.length === 0) {
      console.log("snippets: none");
      continue;
    }

    for (const snippet of snippets) {
      console.log(`- ${snippet.title} [${snippet.language}] score=${snippet.relevance}`);
      console.log(`  ${snippet.excerpt.slice(0, 180)}...`);
    }
  }
}

run().catch((error) => {
  console.error("[FAIL] assistant_docs_preview", error);
  process.exitCode = 1;
});
