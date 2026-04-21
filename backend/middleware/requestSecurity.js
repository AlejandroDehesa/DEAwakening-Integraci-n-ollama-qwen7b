import { sendError } from "../utils/httpResponses.js";

const DEFAULT_ALLOWED_HEADERS = ["Content-Type", "x-admin-key"];
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH"]);

function isTruthy(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").toLowerCase());
}

function splitOrigins(value) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildCorsOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  const configuredOrigins = splitOrigins(process.env.CORS_ALLOWED_ORIGINS);
  const frontendUrl = String(process.env.FRONTEND_URL || "").trim();
  const localhostDefaults = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ];

  const allowAll = configuredOrigins.includes("*");
  const allowlist = new Set(
    [
      ...configuredOrigins.filter((origin) => origin !== "*"),
      ...(frontendUrl ? [frontendUrl] : []),
      ...(!isProduction ? localhostDefaults : [])
    ].map((origin) => origin.replace(/\/+$/, ""))
  );

  if (isProduction && !allowAll && allowlist.size === 0) {
    throw new Error(
      "Missing CORS_ALLOWED_ORIGINS (or FRONTEND_URL) in production"
    );
  }

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");
      if (allowAll || allowlist.has(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: DEFAULT_ALLOWED_HEADERS,
    maxAge: 86400,
    credentials: false
  };
}

export function applySecurityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  const forwardedProto = String(req.header("x-forwarded-proto") || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  const isHttps = req.secure || forwardedProto === "https";

  if (isHttps) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  next();
}

export function enforceRequestConstraints({
  maxUrlLength = 2048,
  requireJsonForWrites = true
} = {}) {
  return function requestConstraints(req, res, next) {
    if (typeof req.originalUrl === "string" && req.originalUrl.length > maxUrlLength) {
      return sendError(res, 414, "Request URL is too long");
    }

    if (requireJsonForWrites && WRITE_METHODS.has(req.method)) {
      const hasBody = Number(req.header("content-length") || 0) > 0;
      if (hasBody && !req.is("application/json")) {
        return sendError(
          res,
          415,
          "Unsupported Media Type: application/json is required"
        );
      }
    }

    return next();
  };
}

export function isRailwayEnvironment() {
  return Boolean(
    process.env.RAILWAY_ENVIRONMENT ||
    process.env.RAILWAY_PROJECT_ID ||
    process.env.RAILWAY_SERVICE_ID
  );
}

export function isRequestLogEnabled() {
  return !isTruthy(process.env.DISABLE_HTTP_LOGS);
}
