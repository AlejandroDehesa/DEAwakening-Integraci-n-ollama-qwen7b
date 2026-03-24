import { fetchEventBySlug, fetchEvents } from "../services/eventsService.js";

export function getEvents(_req, res) {
  res.json(fetchEvents());
}

export function getEventBySlug(req, res) {
  const event = fetchEventBySlug(req.params.slug);

  if (!event) {
    return res.status(404).json({
      message: "Event not found"
    });
  }

  return res.json(event);
}
