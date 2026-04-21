import { sendError } from "../utils/httpResponses.js";

export function errorHandler(error, req, res, _next) {
  if (error?.message === "CORS origin not allowed") {
    return sendError(res, 403, "CORS origin not allowed");
  }

  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
    error?.stack || error?.message || error
  );

  return sendError(res, 500, "Internal server error");
}
