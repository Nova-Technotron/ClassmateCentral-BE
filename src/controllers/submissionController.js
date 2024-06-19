import Submission from '../models/Submission.js';

// Submit assignment
export const submitAssignment = async (req, res) => {
    const { assignmentId, files } = req.body;

    try {
        const newSubmission = await Submission.create({
            student: req.user.id,
            assignment: assignmentId,
            files,
        });

        res.status(201).json({ message: 'Assignment submitted successfully', submission: newSubmission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all submissions
export const getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find().populate('student', 'username').populate('assignment', 'title');
        res.json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get submission by ID
export const getSubmissionById = async (req, res) => {
    const { id } = req.params;

    try {
        const submission = await Submission.findById(id).populate('student', 'username').populate('assignment', 'title');
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        res.json(submission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update submission (for students to resubmit)
export const updateSubmission = async (req, res) => {
    const { id } = req.params;
    const { files } = req.body;

    try {
        const submission = await Submission.findById(id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        submission.files = files;
        await submission.save();

        res.json({ message: 'Submission updated successfully', submission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete submission
export const deleteSubmission = async (req, res) => {
    const { id } = req.params;

    try {
        const submission = await Submission.findById(id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        await submission.remove();
        res.json({ message: 'Submission deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



/**
 * lets have this in v3
 * we can even move this into an instructor 
 * service say we use a micro service in future
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
// Grade submission (instructor only)
export const gradeSubmission = async (req, res) => {
    const { id } = req.params;
    const { grade } = req.body;

    try {
        const submission = await Submission.findById(id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        submission.grade = grade;
        await submission.save();

        res.json({ message: 'Submission graded successfully', submission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
