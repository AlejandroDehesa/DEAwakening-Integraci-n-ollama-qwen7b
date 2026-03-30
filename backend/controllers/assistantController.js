import {
  generateAssistantChatResponse,
  validateAssistantChatPayload
} from "../services/assistantService.js";
import { sendError, sendSuccess } from "../utils/httpResponses.js";

export async function chatWithAssistant(req, res, next) {
  const startedAt = Date.now();
  const validation = validateAssistantChatPayload(req.body);

  if (!validation.success) {
    console.warn(
      `[assistant] validation_error status=400 language=${req.body?.language || "n/a"} pageContext=${req.body?.pageContext || "n/a"} messageLength=${typeof req.body?.message === "string" ? req.body.message.length : 0}`
    );
    return sendError(res, 400, validation.error);
  }

  const { language, pageContext, message } = validation.data;
  console.log(
    `[assistant] request language=${language} pageContext=${pageContext || "n/a"} messageLength=${message.length}`
  );

  try {
    const data = await generateAssistantChatResponse(validation.data);
    const durationMs = Date.now() - startedAt;
    console.log(
      `[assistant] success language=${language} pageContext=${pageContext || "n/a"} intent=${data.pageIntent} docs=${data.knowledgeStatus?.documents || "n/a"} durationMs=${durationMs}`
    );
    return sendSuccess(res, data);
  } catch (error) {
    const durationMs = Date.now() - startedAt;

    if (error?.expose === true && Number.isInteger(error?.status)) {
      console.error(
        `[assistant] handled_error status=${error.status} code=${error.code || "unknown"} language=${language} pageContext=${pageContext || "n/a"} durationMs=${durationMs} message="${error.message}"`
      );
      return sendError(res, error.status, error.message);
    }

    console.error(
      `[assistant] unhandled_error language=${language} pageContext=${pageContext || "n/a"} durationMs=${durationMs}`,
      error?.stack || error?.message || error
    );

    return next(error);
  }
}
