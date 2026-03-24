import { fetchContactInfo } from "../services/contactService.js";

export function getContactInfo(_req, res) {
  res.json(fetchContactInfo());
}
