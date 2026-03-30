import { initializeDatabase } from "../database/database.js";
import { buildAssistantKnowledge } from "../services/assistantKnowledgeOrchestrator.js";
import { loadDocumentKnowledge } from "../services/documentKnowledgeService.js";
import { parseAssistantOutput } from "../services/promptBuilder.js";
import {
  fetchAssistantInsights,
  saveAssistantClick,
  saveAssistantInteraction,
  validateAssistantClickPayload
} from "../services/assistantTelemetryService.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  await initializeDatabase();

  const docs = await loadDocumentKnowledge();
  console.log(`[CHECK] documents status=${docs.status} total=${docs.documents.length}`);
  assert(Array.isArray(docs.documents), "Documents must be an array");

  const normalKnowledge = await buildAssistantKnowledge({
    language: "es",
    pageContext: "home",
    pageSlug: null,
    message: "Quiero entender el enfoque de David"
  });

  console.log(
    `[CHECK] normal knowledge docsStatus=${normalKnowledge.documentKnowledge.status} snippets=${normalKnowledge.documentKnowledge.snippets.length}`
  );
  assert(normalKnowledge.siteKnowledge?.content, "Site knowledge content should exist");

  const previousFlag = process.env.ASSISTANT_FORCE_DOCUMENT_ERROR;
  process.env.ASSISTANT_FORCE_DOCUMENT_ERROR = "true";
  const forcedFallback = await buildAssistantKnowledge({
    language: "en",
    pageContext: "events",
    pageSlug: null,
    message: "Show me event details"
  });
  process.env.ASSISTANT_FORCE_DOCUMENT_ERROR = previousFlag;

  console.log(
    `[CHECK] forced fallback docsStatus=${forcedFallback.documentKnowledge.status}`
  );
  assert(
    forcedFallback.documentKnowledge.status === "unavailable",
    "Document fallback should set status=unavailable"
  );
  assert(forcedFallback.siteKnowledge?.events, "Fallback should preserve site knowledge");

  const parsedContract = parseAssistantOutput(
    JSON.stringify({
      answer: "Puedes empezar por eventos y contacto.",
      pageIntent: "event_discovery",
      confidence: 0.9,
      suggestedActions: [
        {
          type: "route",
          label: "Ver eventos",
          target: "/events"
        },
        {
          type: "event",
          label: "Evento recomendado",
          target: "deawakening-valencia"
        }
      ],
      relatedLinks: [],
      recommendedEventSlug: "deawakening-valencia"
    }),
    {
      language: "es",
      availableEventSlugs: ["deawakening-valencia"]
    }
  );

  assert(
    parsedContract.recommendedEventSlug === "deawakening-valencia",
    "recommendedEventSlug should be stable"
  );
  assert(
    Array.isArray(parsedContract.suggestedActions) &&
      parsedContract.suggestedActions.length > 0,
    "suggestedActions should be normalized"
  );

  const interactionId = await saveAssistantInteraction({
    requestData: {
      message: "Test message for interaction logging",
      language: "es",
      sessionId: "phase-check-session",
      pageContext: "home",
      pageSlug: null
    },
    responseData: {
      answer: "Test answer",
      pageIntent: "guidance",
      confidence: 0.88,
      suggestedActions: [
        { type: "route", label: "Ver eventos", target: "/events" },
        { type: "contact", label: "Contacto", target: "/contact" }
      ],
      relatedLinks: [{ label: "Contacto", target: "/contact" }],
      recommendedEventSlug: "deawakening-valencia",
      knowledgeStatus: {
        site: "ok",
        documents: "ok"
      }
    },
    durationMs: 120
  });
  console.log(`[CHECK] interactionId=${interactionId}`);
  assert(Number.isInteger(interactionId) && interactionId > 0, "Interaction should be saved");

  const clickValidation = validateAssistantClickPayload({
    source: "hero",
    clickType: "suggested-action",
    label: "Ver eventos",
    target: "/events",
    actionType: "route",
    interactionId,
    language: "es",
    pageContext: "home",
    sessionId: "phase-check-session"
  });
  assert(clickValidation.success, `Click validation failed: ${clickValidation.error}`);

  const clickId = await saveAssistantClick(clickValidation.data);
  console.log(`[CHECK] clickId=${clickId}`);
  assert(Number.isInteger(clickId) && clickId > 0, "Click should be saved");

  const insights = await fetchAssistantInsights({ days: 30, limit: 250 });
  console.log(
    `[CHECK] insights interactions=${insights.interactions.total} clicks=${insights.clicks.total}`
  );
  assert(insights.interactions.total > 0, "Insights should include interactions");
  assert(insights.clicks.total > 0, "Insights should include clicks");

  console.log("[PASS] assistantPhase45Phase5Check");
}

run().catch((error) => {
  console.error("[FAIL] assistantPhase45Phase5Check", error);
  process.exitCode = 1;
});
