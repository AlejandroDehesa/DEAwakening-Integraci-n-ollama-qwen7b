import { sendError } from "../utils/httpResponses.js";

export function requireAdminAuth(req, res, next) {
  const expectedKey = process.env.ADMIN_KEY;
  const providedKey = req.header("x-admin-key");

  if (!expectedKey || !providedKey || providedKey !== expectedKey) {
    return sendError(res, 401, "Unauthorized");
  }

  return next();
}
