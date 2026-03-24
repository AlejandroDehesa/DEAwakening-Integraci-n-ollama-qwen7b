import {
  createAdminEvent,
  deleteAdminEvent,
  fetchAdminEvents,
  updateAdminEvent
} from "../services/adminEventsService.js";
import { sendError, sendSuccess } from "../utils/httpResponses.js";

export async function getAdminEvents(_req, res, next) {
  try {
    const events = await fetchAdminEvents();
    return sendSuccess(res, events);
  } catch (error) {
    return next(error);
  }
}

export async function createEvent(req, res, next) {
  try {
    const result = await createAdminEvent(req.body);

    if (!result.success) {
      return sendError(res, result.status, result.message);
    }

    return sendSuccess(res, result.event, 201);
  } catch (error) {
    return next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const result = await updateAdminEvent(Number(req.params.id), req.body);

    if (!result.success) {
      return sendError(res, result.status, result.message);
    }

    return sendSuccess(res, result.event);
  } catch (error) {
    return next(error);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    const result = await deleteAdminEvent(Number(req.params.id));

    if (!result.success) {
      return sendError(res, result.status, result.message);
    }

    return sendSuccess(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
}
