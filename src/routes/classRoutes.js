import express from "express";
import { auth, isAdmin } from "../middleware/authMiddleware.js";
import {
  createClass,
  getClasses,
  joinClass,
  leaveClass,
} from "../controllers/classController.js";

const router = express.Router();

router.post("/", auth, isAdmin, createClass);
router.get("/", auth, getClasses);
router.post("/join", auth, joinClass);
router.delete("/:id/leave", auth, leaveClass);

export default router;
