import { sendError } from "../utils/httpResponses.js";

const ADMIN_KEY = process.env.ADMIN_KEY || "admin123";

export function requireAdminAuth(req, res, next) {
  const providedKey = req.header("x-admin-key");

  if (!providedKey || providedKey !== ADMIN_KEY) {
    return sendError(res, 401, "Unauthorized");
  }

  return next();
}
