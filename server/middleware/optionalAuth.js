import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Optional authentication - sets req.user if token is valid, but doesn't block if not
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      } catch (error) {
        // Token invalid or expired, but we don't block the request
        console.log('Optional auth: Invalid token, continuing without user');
      }
    }

    next();
  } catch (error) {
    // Even if there's an error, continue without user
    next();
  }
};
