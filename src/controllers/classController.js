import Class from '../models/Class.js';
import User from '../models/User.js';

export const createClass = async (req, res) => {
    const { name, description } = req.body;

    try {
        // Create new class
        const newClass = new Class({
            name,
            description,
            createdBy: req.user.id
        });

        // Save class to database
        await newClass.save();

        res.status(201).json({ message: 'Class created successfully', class: newClass });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getClasses = async (req, res) => {
    try {
        // Fetch list of classes from the database
        const classes = await Class.find();
        res.json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateClass = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        // Check if class exists
        let cls = await Class.findById(id);
        if (!cls) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Check if the authenticated user has permission to update the class
        if (!req.user.isAdmin && cls.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this class' });
        }

        // Update class fields
        cls.name = name;
        cls.description = description;

        // Save updated class to database
        await cls.save();

        res.json({ message: 'Class updated successfully', class: cls });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteClass = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if class exists
        const cls = await Class.findById(id);
        if (!cls) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Check if the authenticated user has permission to delete the class
        if (!req.user.isAdmin && cls.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this class' });
        }

        // Delete class from database
        await Class.findByIdAndDelete(id);

        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const joinClass = async (req, res) => {
    const { classCode } = req.body;

    try {
        // Find class by class code
        const cls = await Class.findOne({ classCode });
        if (!cls) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Check if user is already enrolled in the class
        if (cls.members.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are already enrolled in this class' });
        }

        // Add user to class members
        cls.members.push(req.user.id);
        await cls.save();

        // Add class to user's enrolled classes
        req.user.enrolledClasses.push(cls._id);
        await req.user.save();

        res.json({ message: 'You have successfully enrolled in the class', class: cls });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const leaveClass = async (req, res) => {
    const { id } = req.params;

    try {
        // Find class by ID
        const cls = await Class.findById(id);
        if (!cls) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Check if user is enrolled in the class
        if (!cls.members.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are not enrolled in this class' });
        }

        // Remove user from class members
        cls.members = cls.members.filter(memberId => memberId.toString() !== req.user.id);
        await cls.save();

        // Remove class from user's enrolled classes
        req.user.enrolledClasses = req.user.enrolledClasses.filter(classId => classId.toString() !== id);
        await req.user.save();

        res.json({ message: 'You have successfully left the class', class: cls });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
