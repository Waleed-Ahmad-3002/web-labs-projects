const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'No authentication token provided, access denied' 
      });
    }
    
    // Extract token from Bearer token
    const token = authHeader.replace('Bearer ', '');
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by ID
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'User not found, token invalid' });
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({ message: 'User account is deactivated' });
      }
      
      // Add user to request
      req.user = {
        id: user._id,
        username: user.username,
        role: user.role
      };
      
      // Update last active timestamp
      user.lastActive = new Date();
      await user.save();
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token is invalid or expired' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

module.exports = authMiddleware;