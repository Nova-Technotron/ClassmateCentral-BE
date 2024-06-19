import User from '../models/User.js';
import Message from '../models/Message.js';

export const getUserProfile = async (req, res) => {
    try {
        // Fetch user profile from database based on user ID
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateUserProfile = async (req, res) => {
    const { username, email } = req.body;

    try {
        // Fetch user from database based on user ID
        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user profile fields
        user.username = username || user.username;
        user.email = email || user.email;

        // Save updated user profile to database
        await user.save();

        res.json({ message: 'User profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUsers = async (req, res) => {
    try {
        // Fetch list of users from the database
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the authenticated user has permission to delete the user
        if (userId !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this user' });
        }

        // Delete user from database
        await User.findByIdAndDelete(userId);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Send message to user
export const sendMessageToUser = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    try {
        // Check if recipient user exists
        const recipient = await User.findById(id);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient user not found' });
        }

        // Create message
        const message = await Message.create({
            sender: req.user.id,
            recipient: id,
            content,
        });

        res.status(201).json({ message: 'Message sent successfully', message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
