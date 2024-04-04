import Assignment from '../models/Assignment.js';

// Create assignment
export const createAssignment = async (req, res) => {
    const { title, description, dueDate } = req.body;

    try {
        const newAssignment = await Assignment.create({
            title,
            description,
            dueDate,
            instructor: req.user.id,
        });

        res.status(201).json({ message: 'Assignment created successfully', assignment: newAssignment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all assignments
export const getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find().populate('instructor', 'username');
        res.json(assignments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get assignment by ID
export const getAssignmentById = async (req, res) => {
    const { id } = req.params;

    try {
        const assignment = await Assignment.findById(id).populate('instructor', 'username');
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.json(assignment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update assignment
export const updateAssignment = async (req, res) => {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;

    try {
        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        assignment.title = title;
        assignment.description = description;
        assignment.dueDate = dueDate;
        await assignment.save();

        res.json({ message: 'Assignment updated successfully', assignment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete assignment
export const deleteAssignment = async (req, res) => {
    const { id } = req.params;

    try {
        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        await assignment.remove();
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
