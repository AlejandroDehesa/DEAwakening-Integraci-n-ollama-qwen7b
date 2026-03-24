import { Router } from "express";
import { getContactInfo } from "../controllers/contactController.js";

const router = Router();

router.get("/", getContactInfo);

export default router;
