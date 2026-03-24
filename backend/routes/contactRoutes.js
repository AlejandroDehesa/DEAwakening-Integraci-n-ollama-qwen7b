import { Router } from "express";
import {
  getContactInfo,
  submitContactForm
} from "../controllers/contactController.js";

const router = Router();

router.get("/", getContactInfo);
router.post("/", submitContactForm);

export default router;
