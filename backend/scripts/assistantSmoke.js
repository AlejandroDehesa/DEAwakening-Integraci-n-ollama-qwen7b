const BASE_URL = process.env.ASSISTANT_BASE_URL || "http://localhost:5000";
const EXPECT_MISSING_KEY = process.env.ASSISTANT_EXPECT_MISSING_KEY === "true";

function printResult(name, ok, detail = "") {
  const status = ok ? "PASS" : "FAIL";
  console.log(`[${status}] ${name}${detail ? ` - ${detail}` : ""}`);
}

async function callJson(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => null);
  return {
    status: response.status,
    payload
  };
}

function hasStableShape(payload) {
  const data = payload?.data;
  const docsStatus = data?.knowledgeStatus?.documents;

  return (
    payload?.success === true &&
    data &&
    data.contractVersion === "assistant.v2" &&
    typeof data.answer === "string" &&
    typeof data.language === "string" &&
    typeof data.pageIntent === "string" &&
    typeof data.confidence === "number" &&
    Array.isArray(data.suggestedActions) &&
    Array.isArray(data.relatedLinks) &&
    ("recommendedEventSlug" in data) &&
    ("interactionId" in data) &&
    (docsStatus === "ok" || docsStatus === "empty" || docsStatus === "unavailable")
  );
}

async function run() {
  let failed = false;

  const validEs = await callJson("/api/assistant/chat", {
    message: "Quiero entender de que trata DEAwakening",
    language: "es",
    pageContext: "home"
  });

  if (validEs.status === 200 && hasStableShape(validEs.payload)) {
    printResult("valid_es", true);
  } else if (validEs.status === 503 && EXPECT_MISSING_KEY) {
    printResult("valid_es", true, "skipped because missing API key is expected");
  } else if (validEs.status === 503 && !EXPECT_MISSING_KEY) {
    printResult("valid_es", false, "assistant not configured (OPENAI vars missing)");
    failed = true;
  } else {
    printResult("valid_es", false, `status=${validEs.status}`);
    failed = true;
  }

  const validEn = await callJson("/api/assistant/chat", {
    message: "I want to know upcoming events",
    language: "en",
    pageContext: "events"
  });

  if (validEn.status === 200 && hasStableShape(validEn.payload)) {
    printResult("valid_en", true);
  } else if (validEn.status === 503 && EXPECT_MISSING_KEY) {
    printResult("valid_en", true, "skipped because missing API key is expected");
  } else if (validEn.status === 503 && !EXPECT_MISSING_KEY) {
    printResult("valid_en", false, "assistant not configured (OPENAI vars missing)");
    failed = true;
  } else {
    printResult("valid_en", false, `status=${validEn.status}`);
    failed = true;
  }

  const validWithContext = await callJson("/api/assistant/chat", {
    message: "Tell me more about this event",
    language: "en",
    pageContext: "event-detail",
    pageSlug: "deawakening-valencia"
  });

  if (validWithContext.status === 200 && hasStableShape(validWithContext.payload)) {
    printResult("valid_with_page_context", true);
  } else if (validWithContext.status === 503 && EXPECT_MISSING_KEY) {
    printResult(
      "valid_with_page_context",
      true,
      "skipped because missing API key is expected"
    );
  } else {
    printResult("valid_with_page_context", false, `status=${validWithContext.status}`);
    failed = true;
  }

  const validDe = await callJson("/api/assistant/chat", {
    message: "Ich mochte verstehen, wo ich anfangen soll",
    language: "de",
    pageContext: "home"
  });

  if (validDe.status === 200 && hasStableShape(validDe.payload)) {
    printResult("valid_de", true);
  } else if (validDe.status === 503 && EXPECT_MISSING_KEY) {
    printResult("valid_de", true, "skipped because missing API key is expected");
  } else {
    printResult("valid_de", false, `status=${validDe.status}`);
    failed = true;
  }

  const invalidBody = await callJson("/api/assistant/chat", {
    message: "",
    language: "es"
  });

  if (invalidBody.status === 400) {
    printResult("invalid_body_400", true);
  } else {
    printResult("invalid_body_400", false, `status=${invalidBody.status}`);
    failed = true;
  }

  const clickTracking = await callJson("/api/assistant/track-click", {
    source: "hero",
    clickType: "quick-action",
    label: "Quiero entender el enfoque de David",
    target: "qa:understand-david",
    language: "es",
    pageContext: "home"
  });

  if (
    clickTracking.status === 200 &&
    clickTracking.payload?.success === true &&
    typeof clickTracking.payload?.data?.tracked === "boolean"
  ) {
    printResult("click_tracking_shape", true);
  } else {
    printResult("click_tracking_shape", false, `status=${clickTracking.status}`);
    failed = true;
  }

  if (EXPECT_MISSING_KEY) {
    const missingKeyProbe = await callJson("/api/assistant/chat", {
      message: "Ping",
      language: "en"
    });

    const ok =
      missingKeyProbe.status === 503 &&
      String(missingKeyProbe.payload?.error || "").includes("OPENROUTER_API_KEY");
    printResult("missing_api_key_503", ok, `status=${missingKeyProbe.status}`);
    if (!ok) {
      failed = true;
    }
  }

  if (failed) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error("[FAIL] assistant_smoke_unexpected", error);
  process.exitCode = 1;
});
