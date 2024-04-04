import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import {
    getNotifications,
    markNotificationAsRead,
    deleteNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

// Fetch notifications
router.get('/', auth, getNotifications);

// Mark notification as read
router.patch('/:id/read', auth, markNotificationAsRead);

// Delete notification
router.delete('/:id', auth, deleteNotification);

export default router;
