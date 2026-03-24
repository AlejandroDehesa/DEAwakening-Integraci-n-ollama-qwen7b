import {
  createAdminEvent,
  deleteAdminEvent,
  fetchAdminEvents,
  updateAdminEvent
} from "../services/adminEventsService.js";

export async function getAdminEvents(_req, res, next) {
  try {
    const events = await fetchAdminEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
}

export async function createEvent(req, res, next) {
  try {
    const result = await createAdminEvent(req.body);

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }

    return res.status(201).json(result.event);
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const result = await updateAdminEvent(Number(req.params.id), req.body);

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }

    return res.json(result.event);
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    const result = await deleteAdminEvent(Number(req.params.id));

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }

    return res.json({
      success: true
    });
  } catch (error) {
    next(error);
  }
}
