import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getAdminEvents,
  updateEvent
} from "../controllers/adminEventsController.js";

const router = Router();

router.get("/", getAdminEvents);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
