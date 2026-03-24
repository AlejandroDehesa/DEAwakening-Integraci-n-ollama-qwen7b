import { Router } from "express";
import { getEventBySlug, getEvents } from "../controllers/eventsController.js";

const router = Router();

router.get("/", getEvents);
router.get("/:slug", getEventBySlug);

export default router;
