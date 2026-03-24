import {
  fetchContactInfo,
  saveContactMessage,
  validateContactPayload
} from "../services/contactService.js";
import { sendError, sendSuccess } from "../utils/httpResponses.js";

export function getContactInfo(_req, res) {
  return sendSuccess(res, fetchContactInfo());
}

export async function submitContactForm(req, res, next) {
  const validationError = validateContactPayload(req.body);

  if (validationError) {
    return sendError(res, 400, validationError);
  }

  try {
    await saveContactMessage(req.body);

    return sendSuccess(res, { submitted: true });
  } catch (error) {
    return next(error);
  }
}
