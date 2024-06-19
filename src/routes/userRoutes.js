import express from "express";
import { auth, isAdmin } from "../middleware/authMiddleware.js";
import {
  getUserProfile,
  deleteUser,
  getUsers,
  sendMessageToUser,
  updateUserProfile
} from "../controllers/userController.js";
import {updateClass} from '../controllers/classController.js'

const router = express.Router();

router.get("/profile", auth, getUserProfile);
router.put("/profile", auth, updateUserProfile);
router.delete("/:id", auth, deleteUser);
router.get("/", isAdmin, getUsers);
router.put("/:id", auth, updateClass);
router.post('/:id/message', auth, sendMessageToUser);


export default router;
