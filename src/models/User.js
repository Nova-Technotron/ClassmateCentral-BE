
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required:true
    },
    lastName: {
        type: String,
        required:true
    },
    
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type:Boolean,
        default:false
    },
    enrolledClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
    }],
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

const User = model('User', userSchema);

export default User;
