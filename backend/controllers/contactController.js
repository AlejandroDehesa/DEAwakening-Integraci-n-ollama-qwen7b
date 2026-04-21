import {
  fetchContactInfo,
  normalizeContactPayload,
  saveContactMessage,
  validateContactPayload
} from "../services/contactService.js";
import { sendContactNotification } from "../services/contactNotificationService.js";
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
    const contactData = normalizeContactPayload(req.body);
    const createdAt = new Date().toISOString();

    await saveContactMessage(contactData, createdAt);
    const notificationResult = await sendContactNotification({
      ...contactData,
      createdAt
    });

    return sendSuccess(res, {
      submitted: true,
      notificationDelivered: notificationResult?.delivered ?? false,
      notificationSkipped: notificationResult?.skipped ?? false
    });
  } catch (error) {
    if (error?.code === "CONTACT_EMAIL_CONFIG_MISSING") {
      return sendError(
        res,
        503,
        error.message || "Contact email is not configured on the server"
      );
    }

    if (error?.code === "CONTACT_EMAIL_SEND_FAILED") {
      return sendError(res, 502, "Contact email could not be delivered");
    }

    return next(error);
  }
}
