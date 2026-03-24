import {
  fetchContactInfo,
  validateContactPayload
} from "../services/contactService.js";

export function getContactInfo(_req, res) {
  res.json(fetchContactInfo());
}

export function submitContactForm(req, res) {
  const validationError = validateContactPayload(req.body);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  return res.json({
    success: true
  });
}
