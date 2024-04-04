import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/password", auth, changePassword);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);

export default router;
