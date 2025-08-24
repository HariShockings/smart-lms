import jwt from 'jsonwebtoken';
import { db } from '../database/db.js';

export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    console.error('No Authorization header or invalid format');
    return res.status(401).json({
      success: false,
      error: 'No token provided in Authorization header',
    });
  }

  if (!token) {
    console.error('Token is empty');
    return res.status(401).json({
      success: false,
      error: 'No token provided',
    });
  }

  try {
    // Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: JWT_SECRET missing',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', { id: decoded.id });

    // Fetch user from database
    const user = await db('users')
      .select('id', 'first_name', 'last_name', 'username', 'role', 'profile_picture')
      .where({ id: decoded.id })
      .first();

    if (!user) {
      console.error(`User not found for ID: ${decoded.id}`);
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    req.user = user;
    console.log('User authenticated:', { id: user.id, username: user.username, role: user.role });
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.error('Authorize middleware called without authenticated user');
      return res.status(401).json({
        success: false,
        error: 'No authenticated user found',
      });
    }
    if (!roles.includes(req.user.role)) {
      console.error(`Unauthorized role access: ${req.user.role}, required: ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    console.log(`Role authorized: ${req.user.role}`);
    next();
  };
};