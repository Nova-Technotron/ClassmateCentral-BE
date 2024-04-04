import express from 'express';
import { auth, isAdmin } from '../middleware/authMiddleware.js';
import {
    submitAssignment,
    getSubmissions,
    getSubmissionById,
    updateSubmission,
    deleteSubmission,
    gradeSubmission,
} from '../controllers/submissionController.js';

const router = express.Router();

// Submit assignment
router.post('/', auth, submitAssignment);

// Get all submissions (instructor only)
router.get('/', auth, isAdmin, getSubmissions);

// Get submission by ID (instructor only)
router.get('/:id', auth, isAdmin, getSubmissionById);

// Update submission (student only)
router.put('/:id', auth, updateSubmission);

// Delete submission (student only)
router.delete('/:id', auth, deleteSubmission);

// Grade submission (instructor only)
router.put('/:id/grade', auth, isAdmin, gradeSubmission);

export default router;
