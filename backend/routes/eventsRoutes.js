import { Router } from "express";
import { getEvents } from "../controllers/eventsController.js";

const router = Router();

router.get("/", getEvents);

export default router;
