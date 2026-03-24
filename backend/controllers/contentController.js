import {
  fetchContent,
  fetchContentBySectionKey
} from "../services/contentService.js";
import { sendError, sendSuccess } from "../utils/httpResponses.js";

export async function getContent(req, res, next) {
  try {
    const sections = await fetchContent(req.query.lang);
    return sendSuccess(res, sections);
  } catch (error) {
    return next(error);
  }
}

export async function getContentBySectionKey(req, res, next) {
  try {
    const section = await fetchContentBySectionKey(
      req.params.sectionKey,
      req.query.lang
    );

    if (!section) {
      return sendError(res, 404, "Content section not found");
    }

    return sendSuccess(res, section);
  } catch (error) {
    return next(error);
  }
}
