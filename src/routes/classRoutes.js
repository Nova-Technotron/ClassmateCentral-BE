import express from "express";
import { auth, isAdmin } from "../middleware/authMiddleware.js";
import {
  createClass,
  getClasses,
  joinClass,
  leaveClass,
  updateClass
} from "../controllers/classController.js";

const router = express.Router();

router.post("/", auth, isAdmin, createClass);
router.get("/", auth, getClasses);
router.post("/join", auth, joinClass);
router.put("/:id", auth, isAdmin,updateClass)
router.delete("/:id/leave", auth, leaveClass);

export default router;
