import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import {
    getSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule
} from '../controllers/scheduleController.js';

const router = express.Router();

// Protected routes (require authentication)
router.use(auth);

// Routes for class schedules
router.get('/', getSchedules); // Get all schedules
router.get('/:id', getScheduleById); // Get a single schedule by ID
router.post('/', createSchedule); // Create a new schedule
router.put('/:id', updateSchedule); // Update a schedule by ID
router.delete('/:id', deleteSchedule); // Delete a schedule by ID

export default router;