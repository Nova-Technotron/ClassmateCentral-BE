import Announcement from '../models/Announcement.js';
import { validateAnnouncement } from '../validators/announcementValidtor.js';

export const createAnnouncement = async (req, res) => {
    const { title, content } = req.body;

    try {
        const { error } = validateAnnouncement(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        // Create new announcement
        const announcement = new Announcement({
            title,
            createdBy:req.user.id,
            content

        });

        // Save announcement to database
        await announcement.save();

        res.status(201).json({ message: 'Announcement created successfully', announcement });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAnnouncements = async (req, res) => {
    try {
        // Fetch list of announcements from the database
        const announcements = await Announcement.find().populate('createdBy', 'username');
        res.json(announcements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateAnnouncement = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;


    try {
        const { error } = validateAnnouncement(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        // Check if announcement exists
        let announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Check if the authenticated user is the creator of the announcement
        if (announcement.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this announcement' });
        }

        // Update announcement fields
        announcement.title = title;
        announcement.content = content;

        // Save updated announcement to database
        await announcement.save();

        res.json({ message: 'Announcement updated successfully', announcement });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteAnnouncement = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if announcement exists
        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Check if the authenticated user has permission to delete the announcement
        if (announcement.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this announcement' });
        }

        // Delete announcement from database
        await Announcement.findByIdAndDelete(id);

        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
