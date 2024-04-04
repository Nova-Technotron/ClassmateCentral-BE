import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true,
    },
    files: [String], // Array of file paths
    grade: {
        type: Number,
        default: null,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
