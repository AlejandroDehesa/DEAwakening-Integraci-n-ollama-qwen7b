import { loadDocumentKnowledge } from "../services/documentKnowledgeService.js";

function print(label, value) {
  console.log(`${label}: ${value}`);
}

async function run() {
  const loaded = await loadDocumentKnowledge();
  const docs = Array.isArray(loaded.documents) ? loaded.documents : [];
  const warnings = loaded.metadata?.warnings || [];

  print("status", loaded.status);
  print("source", loaded.source || "n/a");
  print("totalDocuments", docs.length);
  print("warnings", warnings.length);

  for (const warning of warnings.slice(0, 20)) {
    console.log(`- warning: ${warning}`);
  }

  const missingTags = docs.filter((doc) => !Array.isArray(doc.tags) || doc.tags.length === 0);
  const missingPageContext = docs.filter(
    (doc) => !Array.isArray(doc.pageContexts) || doc.pageContexts.length === 0
  );
  const shortDocs = docs.filter((doc) => Number(doc.contentLength || 0) < 80);

  print("missingTags", missingTags.length);
  print("missingPageContexts", missingPageContext.length);
  print("shortDocuments", shortDocs.length);

  if (docs.length === 0) {
    console.error("[FAIL] No assistant documents were loaded.");
    process.exitCode = 1;
    return;
  }

  if (warnings.length > 0) {
    console.warn("[WARN] Some material warnings were found. Review output above.");
  }

  console.log("[PASS] Material validation completed.");
}

run().catch((error) => {
  console.error("[FAIL] assistant_validate_materials", error);
  process.exitCode = 1;
});
