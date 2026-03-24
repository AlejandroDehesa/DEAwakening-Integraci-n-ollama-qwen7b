import {
  fetchContent,
  fetchContentBySectionKey
} from "../services/contentService.js";

export async function getContent(req, res, next) {
  try {
    const sections = await fetchContent(req.query.lang);
    res.json(sections);
  } catch (error) {
    next(error);
  }
}

export async function getContentBySectionKey(req, res, next) {
  try {
    const section = await fetchContentBySectionKey(
      req.params.sectionKey,
      req.query.lang
    );

    if (!section) {
      return res.status(404).json({
        message: "Content section not found"
      });
    }

    return res.json(section);
  } catch (error) {
    next(error);
  }
}
