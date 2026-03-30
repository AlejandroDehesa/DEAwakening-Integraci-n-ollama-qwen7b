import {
  generateAssistantChatResponse,
  validateAssistantChatPayload
} from "../services/assistantService.js";
import { sendError, sendSuccess } from "../utils/httpResponses.js";

export async function chatWithAssistant(req, res, next) {
  const validation = validateAssistantChatPayload(req.body);

  if (!validation.success) {
    return sendError(res, 400, validation.error);
  }

  try {
    const data = await generateAssistantChatResponse(validation.data);
    return sendSuccess(res, data);
  } catch (error) {
    if (error?.expose === true && Number.isInteger(error?.status)) {
      return sendError(res, error.status, error.message);
    }

    return next(error);
  }
}
