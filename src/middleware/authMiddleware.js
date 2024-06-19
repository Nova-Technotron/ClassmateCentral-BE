import jwt from 'jsonwebtoken';
import { secret } from '../config/index.js';
import User from '../models/User.js';


export const auth = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
  
    const token = authHeader.split(' ')[1];

    // Check if token exists
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, "secret");

        // Add user from payload to request object
        req.user = decoded.user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};


export const isAdmin = async (req, res, next) => {
    try {
        // Extract token from request header
        const token = req.header('Authorization').replace('Bearer ', '');

        // Verify token
        const decoded = jwt.verify(token, "secret");

        // Fetch user from database
        const user = await User.findById(decoded.user.id);
        // console.log(user)

        // Check if user is an administrator
        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized as an administrator' });
        }

        // Store user in request object for further use
        req.user = user;

        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
