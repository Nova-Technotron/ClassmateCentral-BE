import Message from '../models/Message.js';

// Send message
export const sendMessage = async (req, res) => {
    const { recipient, content } = req.body;

    try {
        // Create message
        const message = await Message.create({
            sender: req.user.id,
            recipient,
            content,
        });

        res.status(201).json({ message: 'Message sent successfully', message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch messages
export const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ sender: req.user.id }, { recipient: req.user.id }],
        }).sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        message.read = true;
        await message.save();

        res.json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete message
export const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        await message.remove();

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Fetch inbox messages
export const getInboxMessages = async (req, res) => {
    try {
        const messages = await Message.find({ recipient: req.user.id }).sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Reply to message
export const replyToMessage = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    try {
        // Check if message exists
        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Create reply message
        const reply = await Message.create({
            sender: req.user.id,
            recipient: message.sender,
            content,
        });

        res.status(201).json({ message: 'Reply sent successfully', reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * the idea is to have a situation where the class can have groups for project group conversation and discussion 
 * possibly v2
 * @param {*} req 
 * @param {*} res 
 */
// Send group message
export const sendGroupMessage = async (req, res) => {
    const { content } = req.body;
    const { groupId } = req.params;

    try {
        const message = await Message.create({
            sender: req.user.id,
            content,
            groupId,
        });

        res.status(201).json({ message: 'Group message sent successfully', message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get group messages
export const getGroupMessages = async (req, res) => {
    const { groupId } = req.params;

    try {
        const messages = await Message.find({ groupId }).sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
