import { sendError } from "../utils/httpResponses.js";

function getClientIp(req) {
  const forwardedFor = String(req.header("x-forwarded-for") || "")
    .split(",")[0]
    .trim();

  if (forwardedFor) {
    return forwardedFor;
  }

  return req.ip || req.socket?.remoteAddress || "unknown";
}

function cleanupExpiredEntries(store, now) {
  for (const [key, entry] of store.entries()) {
    if (!entry || entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function createRateLimiter({
  keyPrefix = "global",
  windowMs = 60000,
  max = 120,
  message = "Too many requests. Please try again in a moment.",
  skip = null
} = {}) {
  const store = new Map();

  return function rateLimitMiddleware(req, res, next) {
    if (typeof skip === "function" && skip(req)) {
      return next();
    }

    const now = Date.now();
    if (store.size > 5000) {
      cleanupExpiredEntries(store, now);
    }

    const key = `${keyPrefix}:${getClientIp(req)}`;
    const existing = store.get(key);

    if (!existing || existing.resetAt <= now) {
      const nextEntry = {
        count: 1,
        resetAt: now + windowMs
      };
      store.set(key, nextEntry);

      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - 1)));
      res.setHeader("X-RateLimit-Reset", String(Math.ceil(nextEntry.resetAt / 1000)));
      return next();
    }

    existing.count += 1;
    store.set(key, existing);

    const remaining = Math.max(0, max - existing.count);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(existing.resetAt / 1000)));

    if (existing.count > max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000)
      );
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return sendError(res, 429, message);
    }

    return next();
  };
}
