import { Router } from "express";
import {
  chatWithAssistant,
  trackAssistantClick
} from "../controllers/assistantController.js";

const router = Router();

router.post("/chat", chatWithAssistant);
router.post("/track-click", trackAssistantClick);

export default router;
