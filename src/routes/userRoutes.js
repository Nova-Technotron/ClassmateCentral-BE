import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import { getUserProfile } from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', auth, getUserProfile);

export default router;
