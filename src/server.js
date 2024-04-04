import express from 'express';
import setupSwagger from './swagger.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import classRoutes from './routes/classRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
/**
 * Start your Node.js server and 
 * navigate to http://localhost:<PORT>/api-docs 
 * in your web browser to view the generated Swagger documentation.
 */
setupSwagger(app);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {})
.then(() => {
    console.log('MongoDB connected');
})
.catch((error) => {
    console.error('MongoDB connection failed:', error.message);
});

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
