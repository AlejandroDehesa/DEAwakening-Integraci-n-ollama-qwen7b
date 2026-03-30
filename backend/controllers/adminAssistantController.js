import {
  fetchAssistantInsights,
  parseAssistantInsightsQuery
} from "../services/assistantTelemetryService.js";
import { sendSuccess } from "../utils/httpResponses.js";

export async function getAssistantInsights(req, res, next) {
  try {
    const query = parseAssistantInsightsQuery(req.query);
    const data = await fetchAssistantInsights(query);
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}
