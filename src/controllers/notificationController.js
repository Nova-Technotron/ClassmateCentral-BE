import Notification from '../models/Notification.js';


export const createNotification = async (req, res) => {
    try {
        const { title, message } = req.body;

        
        if (!title || !message) {
            return res.status(400).json({ message: 'Title and message are required' });
        }

        const newNotification = new Notification({
            title,
            message,
            user: req.user.id,
            createdAt: new Date(),
        });

        await newNotification.save();

        res.status(201).json({ message: 'Notification created successfully', notification: newNotification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
        // .sort({ createdAt: -1 });
        if(notifications.length ===0 ){
          return  res.json({message: "You have no notification"})
        }
        res.json(notifications.reverse());
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.read = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete notification
export const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await Notification.findById(req.params.id);

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
