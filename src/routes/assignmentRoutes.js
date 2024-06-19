import express from 'express';
import { auth, isAdmin } from '../middleware/authMiddleware.js';
import {
    createAssignment,
    getAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
} from '../controllers/assignmentController.js';

const router = express.Router();

// Create assignment (instructor only)
router.post('/', auth, isAdmin, createAssignment);

// Get all assignments
router.get('/', auth, getAssignments);

// Get assignment by ID
router.get('/:id', auth, getAssignmentById);

// Update assignment (instructor only)
router.put('/:id', auth, isAdmin, updateAssignment);

// Delete assignment (instructor only)
router.delete('/:id', auth, isAdmin, deleteAssignment);

export default router;
