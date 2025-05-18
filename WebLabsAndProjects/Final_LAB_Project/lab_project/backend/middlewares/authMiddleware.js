import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Try to get token from HTTP-only cookie
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // 2. If not in cookie, try to get token from Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Get token after "Bearer "
    } catch (error) {
        console.error('Error parsing token from header:', error);
        res.status(401);
        throw new Error('Not authorized, token format invalid');
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found for this token');
      }
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401);
      // Distinguish between expired token and other failures if needed
      if (error.name === 'TokenExpiredError') {
          throw new Error('Not authorized, token expired');
      }
      throw new Error('Not authorized, token failed or invalid');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token provided'); // More specific message
  }
});

// Middleware to check if user is a Farmer
const farmer = (req, res, next) => {
  if (req.user && req.user.userType === 'Farmer') {
    next();
  } else {
    res.status(403); // Forbidden
    throw new Error('Not authorized as a Farmer');
  }
};

// Middleware for admin access
const admin = (req, res, next) => {
  if (req.user && req.user.userType === 'Admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

export { protect, farmer, admin };