import {
  fetchAdminContent,
  updateAdminContent
} from "../services/adminContentService.js";
import { sendError, sendSuccess } from "../utils/httpResponses.js";

export async function getAdminContent(_req, res, next) {
  try {
    const content = await fetchAdminContent();
    return sendSuccess(res, content);
  } catch (error) {
    return next(error);
  }
}

export async function updateContent(req, res, next) {
  try {
    const result = await updateAdminContent(req.params.sectionKey, req.body);

    if (!result.success) {
      return sendError(res, result.status, result.message);
    }

    return sendSuccess(res, result.section);
  } catch (error) {
    return next(error);
  }
}
