import { Router } from "express";
import {
  getEventBySlug,
  getEvents,
  submitEventRegistration
} from "../controllers/eventsController.js";

const router = Router();

router.get("/", getEvents);
router.get("/:slug", getEventBySlug);
router.post("/:id/register", submitEventRegistration);

export default router;
