import { fetchContent } from "../services/contentService.js";

export function getContent(_req, res) {
  res.json(fetchContent());
}
