import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import {
    sendMessage,
    getMessages,
    markMessageAsRead,
    deleteMessage,
    sendGroupMessage, 
    getGroupMessages,
    getInboxMessages,
    replyToMessage
} from '../controllers/messageController.js';

const router = express.Router();

// Send message
router.post('/', auth, sendMessage);

// Fetch messages
router.get('/', auth, getMessages);

// Mark message as read
router.patch('/:id/read', auth, markMessageAsRead);

// Delete message
router.delete('/:id', auth, deleteMessage);

// Fetch inbox messages
router.get('/inbox', auth, getInboxMessages);

// Reply to message
router.post('/:id/reply', auth, replyToMessage);


/**
 * this will be left
 * till v2
 */

// Send group message
router.post('/groups/:groupId/messages', auth, sendGroupMessage);

// Get group messages
router.get('/groups/:groupId/messages', auth, getGroupMessages);



export default router;
