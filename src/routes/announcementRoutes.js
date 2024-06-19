import express from "express";
import { auth, isAdmin } from "../middleware/authMiddleware.js";
import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";

const router = express.Router();

router.post("/", auth, isAdmin, createAnnouncement);
router.get("/", auth, getAnnouncements);
router.put("/:id", auth, isAdmin,updateAnnouncement);
router.delete("/:id", auth, isAdmin, deleteAnnouncement);

export default router;
