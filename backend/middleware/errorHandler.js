import { sendError } from "../utils/httpResponses.js";

export function errorHandler(error, req, res, _next) {
  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
    error?.stack || error?.message || error
  );

  return sendError(res, 500, "Internal server error");
}
