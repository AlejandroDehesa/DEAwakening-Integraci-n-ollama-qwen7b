import {
  generateAssistantChatResponse,
  validateAssistantChatPayload
} from "../services/assistantService.js";
import {
  saveAssistantInteraction,
  saveAssistantClick,
  validateAssistantClickPayload
} from "../services/assistantTelemetryService.js";
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

    let interactionId = null;
    try {
      interactionId = await saveAssistantInteraction({
        requestData: validation.data,
        responseData: data,
        durationMs
      });
    } catch (trackingError) {
      console.warn(
        `[assistant] interaction_tracking_failed language=${language} pageContext=${pageContext || "n/a"} reason="${trackingError?.message || "unknown"}"`
      );
    }

    console.log(
      `[assistant] success language=${language} pageContext=${pageContext || "n/a"} intent=${data.pageIntent} docs=${data.knowledgeStatus?.documents || "n/a"} durationMs=${durationMs}`
    );
    return sendSuccess(res, {
      ...data,
      interactionId
    });
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

export async function trackAssistantClick(req, res, next) {
  const validation = validateAssistantClickPayload(req.body);
  if (!validation.success) {
    return sendError(res, 400, validation.error);
  }

  try {
    const clickId = await saveAssistantClick(validation.data);
    return sendSuccess(res, {
      tracked: true,
      clickId
    });
  } catch (error) {
    console.warn(
      `[assistant] click_tracking_failed source=${validation.data.source} clickType=${validation.data.clickType} reason="${error?.message || "unknown"}"`
    );
    return sendSuccess(res, {
      tracked: false,
      clickId: null
    });
  }
}
