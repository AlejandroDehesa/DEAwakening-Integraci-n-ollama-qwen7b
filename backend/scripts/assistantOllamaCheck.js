const OLLAMA_BASE_URL = String(process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(
  /\/+$/,
  ""
);
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen:7b";
const TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 8000);

function printResult(name, ok, detail = "") {
  const status = ok ? "PASS" : "FAIL";
  console.log(`[${status}] ${name}${detail ? ` - ${detail}` : ""}`);
}

function createTimeoutSignal(ms) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId)
  };
}

async function checkTags() {
  const { signal, clear } = createTimeoutSignal(TIMEOUT_MS);
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = payload?.error || payload?.message || `status ${response.status}`;
      return { ok: false, detail: `tags endpoint error: ${errorMessage}` };
    }

    const models = Array.isArray(payload?.models) ? payload.models : [];
    const hasModel = models.some((item) => item?.name === OLLAMA_MODEL);
    return {
      ok: true,
      detail: hasModel
        ? `model ${OLLAMA_MODEL} available`
        : `model ${OLLAMA_MODEL} not listed in /api/tags`
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      return { ok: false, detail: `timeout after ${TIMEOUT_MS}ms` };
    }
    return { ok: false, detail: "cannot reach Ollama base URL" };
  } finally {
    clear();
  }
}

async function checkChat() {
  const { signal, clear } = createTimeoutSignal(TIMEOUT_MS);
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [
          {
            role: "system",
            content: "Eres un asistente de esta web. Responde de forma clara y util."
          },
          {
            role: "user",
            content: "Devuelve una respuesta JSON valida para una comprobacion tecnica."
          }
        ]
      }),
      signal
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const providerError =
        (typeof payload?.error === "string" ? payload.error : payload?.error?.message) ||
        payload?.message ||
        `status ${response.status}`;
      return {
        ok: false,
        detail: `chat endpoint error: ${providerError}`
      };
    }

    const content =
      typeof payload?.message?.content === "string"
        ? payload.message.content
        : typeof payload?.response === "string"
          ? payload.response
          : "";
    if (!content.trim()) {
      return {
        ok: false,
        detail: "chat response has no message.content/response text"
      };
    }

    return {
      ok: true,
      detail: `chat response content length ${content.length}`
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      return { ok: false, detail: `timeout after ${TIMEOUT_MS}ms` };
    }
    return { ok: false, detail: "cannot reach /api/chat" };
  } finally {
    clear();
  }
}

async function run() {
  console.log(`[info] baseUrl=${OLLAMA_BASE_URL} model=${OLLAMA_MODEL} timeoutMs=${TIMEOUT_MS}`);

  let failed = false;
  const tagsCheck = await checkTags();
  printResult("ollama_tags", tagsCheck.ok, tagsCheck.detail);
  if (!tagsCheck.ok) {
    failed = true;
  }

  const chatCheck = await checkChat();
  printResult("ollama_chat", chatCheck.ok, chatCheck.detail);
  if (!chatCheck.ok) {
    failed = true;
  }

  if (failed) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error("[FAIL] assistant_ollama_check_unexpected", error);
  process.exitCode = 1;
});

