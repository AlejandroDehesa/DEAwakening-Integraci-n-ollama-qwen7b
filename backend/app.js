import cors from "cors";
import express from "express";
import morgan from "morgan";
import { initializeDatabase } from "./database/database.js";
import { requireAdminAuth } from "./middleware/adminAuth.js";
import contentRoutes from "./routes/contentRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminContentRoutes from "./routes/adminContentRoutes.js";
import adminEventsRoutes from "./routes/adminEventsRoutes.js";
import eventsRoutes from "./routes/eventsRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = Number(process.env.PORT || 5000);

if (!process.env.ADMIN_KEY) {
  throw new Error("Missing required environment variable: ADMIN_KEY");
}

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

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
app.use("/api/admin/events", requireAdminAuth, adminEventsRoutes);
app.use("/api/admin/content", requireAdminAuth, adminContentRoutes);
app.use(errorHandler);

await initializeDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
