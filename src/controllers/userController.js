import User from '../models/User.js';

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
