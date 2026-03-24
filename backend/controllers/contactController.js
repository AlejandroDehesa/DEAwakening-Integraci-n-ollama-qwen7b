import {
  fetchContactInfo,
  saveContactMessage,
  validateContactPayload
} from "../services/contactService.js";

export function getContactInfo(_req, res) {
  res.json(fetchContactInfo());
}

export async function submitContactForm(req, res, next) {
  const validationError = validateContactPayload(req.body);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  try {
    await saveContactMessage(req.body);

    return res.json({
      success: true
    });
  } catch (error) {
    next(error);
  }
}
