import { Router } from "express";
import { getAssistantInsights } from "../controllers/adminAssistantController.js";

const router = Router();

router.get("/insights", getAssistantInsights);

export default router;
