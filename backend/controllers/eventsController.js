import {
  fetchEventBySlug,
  fetchEvents,
  registerForEvent
} from "../services/eventsService.js";
import { sendError, sendSuccess } from "../utils/httpResponses.js";

export async function getEvents(req, res, next) {
  try {
    const events = await fetchEvents(req.query.lang);
    return sendSuccess(res, events);
  } catch (error) {
    return next(error);
  }
}

export async function getEventBySlug(req, res, next) {
  try {
    const event = await fetchEventBySlug(req.params.slug, req.query.lang);

    if (!event) {
      return sendError(res, 404, "Event not found");
    }

    return sendSuccess(res, event);
  } catch (error) {
    return next(error);
  }
}

export async function submitEventRegistration(req, res, next) {
  try {
    const result = await registerForEvent(Number(req.params.id), req.body);

    if (!result.success) {
      return sendError(res, result.status, result.message);
    }

    return sendSuccess(res, { registered: true });
  } catch (error) {
    return next(error);
  }
}
