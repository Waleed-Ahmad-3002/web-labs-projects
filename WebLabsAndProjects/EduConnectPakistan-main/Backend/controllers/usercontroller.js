const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
// Get User Profile
/*
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming authenticated user
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching user profile', 
            error: error.message 
        });
    }
};*/
// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      const uploadDir = 'uploads/profile-images';
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'profile-' + uniqueSuffix + ext);
    }
  });
  
  // File filter to allow only images
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  };
  
  // Set up multer upload
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
  }).single('profileImage');
  
  // Upload profile image controller
  const uploadProfileImage = async (req, res) => {
    try {
      // Handle file upload using multer
      upload(req, res, async function(err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred
          return res.status(400).json({ 
            success: false, 
            message: `Upload error: ${err.message}` 
          });
        } else if (err) {
          // An unknown error occurred
          return res.status(400).json({ 
            success: false, 
            message: err.message || 'File upload failed' 
          });
        }
        
        // If no file was provided
        if (!req.file) {
          return res.status(400).json({ 
            success: false, 
            message: 'Please provide an image file' 
          });
        }
        
        // Get the user ID from the authenticated request
        const userId = req.user.id;
        
        // Get the file path
        const imagePath = req.file.path.replace(/\\/g, '/'); // Normalize path for all OS
        
        // Update user with new profile picture
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { profilePicture: `/${imagePath}` }, // Store with leading slash for URL
          { new: true, select: '-password' } // Return updated user without password
        );
        
        if (!updatedUser) {
          // If user not found, remove uploaded file
          fs.unlinkSync(req.file.path);
          return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
          });
        }
        
        // Return success with updated user
        res.status(200).json({
          success: true,
          message: 'Profile picture updated successfully',
          user: {
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            profilePicture: updatedUser.profilePicture
          }
        });
      });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during image upload',
        error: error.message
      });
    }
  };
  
  // Get user profile controller
  /*
  const getUserProfile = async (req, res) => {
    console.log("Calling userpofile controller");
    try {
      const userId = req.user.id;
      
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          city: user.city,
          country: user.country,
          role: user.role,
          profilePicture: user.profilePicture,
          lastActive: user.lastActive
        }
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error fetching profile',
        error: error.message  
      });
    }
  };*/
    const getUserProfile = async (req, res) => {
    console.log("Calling userProfile controller");
    try {
      // Get user ID either from req.user.id or from URL parameter
      const userId = req.params.id || req.user.id;
      
      // Find user by ID
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Return user data
      return res.status(200).json({
        success: true,
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          city: user.city,
          country: user.country,
          role: user.role,
          profilePicture: user.profilePicture,
          lastActive: user.lastActive
        }
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error fetching profile',
        error: error.message
      });
    }
  };
  const getUserById = async (req, res) => {
    try {
      const userId = req.params.id;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          city: user.city,
          country: user.country,
          role: user.role,
          profilePicture: user.profilePicture
        }
      });
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error fetching user',
        error: error.message
      });
    }
  };

// Update User Profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            username, 
            phoneNumber, 
            city, 
            country, 
            profilePicture 
        } = req.body;

        const updateData = {
            username,
            phoneNumber,
            city,
            country
        };

        // Handle profile picture upload if needed
        if (profilePicture) {
            updateData.profilePicture = profilePicture;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating user profile', 
            error: error.message 
        });
    }
};
module.exports = {
    getUserProfile,
    updateUserProfile,
    uploadProfileImage,
    getUserById
};