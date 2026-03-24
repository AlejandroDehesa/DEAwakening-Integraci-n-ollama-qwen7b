import {
  fetchEventBySlug,
  fetchEvents,
  registerForEvent
} from "../services/eventsService.js";

export async function getEvents(req, res, next) {
  try {
    const events = await fetchEvents(req.query.lang);
    res.json(events);
  } catch (error) {
    next(error);
  }
}

export async function getEventBySlug(req, res, next) {
  try {
    const event = await fetchEventBySlug(req.params.slug, req.query.lang);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    return res.json(event);
  } catch (error) {
    next(error);
  }
}

export async function submitEventRegistration(req, res, next) {
  try {
    const result = await registerForEvent(Number(req.params.id), req.body);

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
