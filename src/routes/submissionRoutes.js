import express from 'express';
import { auth } from '../middleware/authMiddleware';
import { submitAssignment,getSubmissionById, getSubmissions,updateSubmission,deleteSubmission,gradeSubmission } from '../controllers/submissionController';


const router = express.Router();

router.post("/", auth, submitAssignment);
router.get("/", auth, getSubmissions)
router.post("/:id/grade", auth, gradeSubmission)
router.get('/:id', auth, getSubmissionById)
router.put("/:id", auth, updateSubmission)
router.delete(":id", auth, deleteSubmission)
