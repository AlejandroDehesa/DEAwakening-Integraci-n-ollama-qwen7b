import {
  fetchAdminContent,
  updateAdminContent
} from "../services/adminContentService.js";

export async function getAdminContent(_req, res, next) {
  try {
    const content = await fetchAdminContent();
    res.json(content);
  } catch (error) {
    next(error);
  }
}

export async function updateContent(req, res, next) {
  try {
    const result = await updateAdminContent(req.params.sectionKey, req.body);

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        message: result.message
      });
    }

    return res.json(result.section);
  } catch (error) {
    next(error);
  }
}
