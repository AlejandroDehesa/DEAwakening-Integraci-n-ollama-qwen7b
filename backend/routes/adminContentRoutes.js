import { Router } from "express";
import {
  getAdminContent,
  updateContent
} from "../controllers/adminContentController.js";

const router = Router();

router.get("/", getAdminContent);
router.put("/:sectionKey", updateContent);

export default router;
