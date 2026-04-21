import crypto from "crypto";
import { sendError } from "../utils/httpResponses.js";

export function requireAdminAuth(req, res, next) {
  const expectedKey = String(process.env.ADMIN_KEY || "");
  const providedKey = String(req.header("x-admin-key") || "");

  if (!expectedKey) {
    return sendError(res, 503, "Admin authentication is not configured");
  }

  if (!providedKey) {
    return sendError(res, 401, "Unauthorized");
  }

  const expectedBuffer = Buffer.from(expectedKey);
  const providedBuffer = Buffer.from(providedKey);

  const isValid =
    expectedBuffer.length === providedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, providedBuffer);

  if (!isValid) {
    return sendError(res, 401, "Unauthorized");
  }

  return next();
}
