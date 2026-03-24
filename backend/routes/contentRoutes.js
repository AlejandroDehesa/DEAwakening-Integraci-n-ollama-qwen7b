import { Router } from "express";
import {
  getContent,
  getContentBySectionKey
} from "../controllers/contentController.js";

const router = Router();

router.get("/", getContent);
router.get("/:sectionKey", getContentBySectionKey);

export default router;
