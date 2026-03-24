import { fetchEvents } from "../services/eventsService.js";

export function getEvents(_req, res) {
  res.json(fetchEvents());
}
