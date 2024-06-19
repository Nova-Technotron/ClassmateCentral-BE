import mongoose from 'mongoose';
import {announcementSchema} from './Announcement.js'; 
const classSchema = new mongoose.Schema(
    {
        className: {
            type: String,
            required: true,
        },
        classCode: {
            type: String,
            required: true,
            unique: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        announcements: [announcementSchema],
    },
    { timestamps: true }
);

const Class = mongoose.model('Class', classSchema);

export default Class;
