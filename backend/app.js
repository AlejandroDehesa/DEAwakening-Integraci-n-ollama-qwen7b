import cors from "cors";
import express from "express";
import morgan from "morgan";
import contentRoutes from "./routes/contentRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import { initializeDatabase } from "./database/database.js";
import eventsRoutes from "./routes/eventsRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/status", (_req, res) => {
  res.json({
    status: "ok",
    message: "API running"
  });
});

app.use("/api/content", contentRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/contact", contactRoutes);
app.use(errorHandler);

await initializeDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
