import cors from "cors";
import express from "express";
import morgan from "morgan";
import { initializeDatabase } from "./database/database.js";
import { requireAdminAuth } from "./middleware/adminAuth.js";
import { createRateLimiter } from "./middleware/rateLimit.js";
import {
  applySecurityHeaders,
  buildCorsOptions,
  enforceRequestConstraints,
  isRailwayEnvironment,
  isRequestLogEnabled
} from "./middleware/requestSecurity.js";
import contentRoutes from "./routes/contentRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminContentRoutes from "./routes/adminContentRoutes.js";
import adminEventsRoutes from "./routes/adminEventsRoutes.js";
import adminAssistantRoutes from "./routes/adminAssistantRoutes.js";
import assistantRoutes from "./routes/assistantRoutes.js";
import eventsRoutes from "./routes/eventsRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = Number(process.env.PORT || 5000);
const isProductionLike = isRailwayEnvironment() || process.env.NODE_ENV === "production";

if (!process.env.ADMIN_KEY) {
  throw new Error("Missing required environment variable: ADMIN_KEY");
}

if (isProductionLike) {
  const normalizedAdminKey = process.env.ADMIN_KEY.trim().toLowerCase();
  const insecureAdminKeys = new Set([
    "admin123",
    "change-this-admin-key",
    "changeme",
    "default",
    "test"
  ]);

  if (!normalizedAdminKey || insecureAdminKeys.has(normalizedAdminKey)) {
    throw new Error(
      "Insecure ADMIN_KEY for production/Railway. Configure a strong non-placeholder ADMIN_KEY."
    );
  }
}

if (isProductionLike) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");
app.use(applySecurityHeaders);
app.use(cors(buildCorsOptions()));
app.use(
  enforceRequestConstraints({
    maxUrlLength: 2048,
    requireJsonForWrites: true
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

if (isRequestLogEnabled()) {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

const apiLimiter = createRateLimiter({
  keyPrefix: "api",
  windowMs: 60 * 1000,
  max: 180,
  message: "Too many API requests. Please try again shortly."
});

const contactLimiter = createRateLimiter({
  keyPrefix: "contact",
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: "Too many contact requests. Please wait a few minutes and try again."
});

const eventsRegistrationLimiter = createRateLimiter({
  keyPrefix: "events-register",
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: "Too many registration attempts. Please wait a few minutes and try again."
});

const assistantChatLimiter = createRateLimiter({
  keyPrefix: "assistant-chat",
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many assistant requests. Please try again in a moment."
});

const adminLimiter = createRateLimiter({
  keyPrefix: "admin",
  windowMs: 5 * 60 * 1000,
  max: 120,
  message: "Too many admin requests. Please wait and retry."
});

app.use("/api", apiLimiter);
app.use("/api/contact", contactLimiter);
app.use("/api/events/:id/register", eventsRegistrationLimiter);
app.use("/api/assistant/chat", assistantChatLimiter);
app.use("/api/admin", adminLimiter);

app.get("/api/status", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      message: "API running"
    },
    error: null
  });
});

app.use("/api/content", contentRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/admin/events", requireAdminAuth, adminEventsRoutes);
app.use("/api/admin/content", requireAdminAuth, adminContentRoutes);
app.use("/api/admin/assistant", requireAdminAuth, adminAssistantRoutes);
app.use("/api/*", (_req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: "API route not found"
  });
});
app.use(errorHandler);

await initializeDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
