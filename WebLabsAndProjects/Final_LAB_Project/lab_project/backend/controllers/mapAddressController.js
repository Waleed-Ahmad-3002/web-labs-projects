import asyncHandler from 'express-async-handler';
import MapAddress from '../models/MapAddress.js';

// @desc    Create or update a map address for a user
// @route   POST /api/mapaddress
// @access  Private
const createOrUpdateMapAddress = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    res.status(400);
    throw new Error('Please provide both latitude and longitude');
  }

  // Check if the user already has a map address
  let mapAddress = await MapAddress.findOne({ user: req.user._id });

  if (mapAddress) {
    // Update existing map address
    mapAddress.latitude = latitude;
    mapAddress.longitude = longitude;
    await mapAddress.save();
  } else {
    // Create new map address
    mapAddress = await MapAddress.create({
      user: req.user._id,
      latitude,
      longitude
    });
  }

  res.status(201).json({
    success: true,
    data: mapAddress
  });
});

// @desc    Get map address for a user
// @route   GET /api/mapaddress
// @access  Private
const getMapAddress = asyncHandler(async (req, res) => {
  const mapAddress = await MapAddress.findOne({ user: req.user._id });

  if (!mapAddress) {
    res.status(404);
    throw new Error('Map address not found');
  }

  res.status(200).json({
    success: true,
    data: mapAddress
  });
});

// @desc    Get all map addresses
// @route   GET /api/mapaddress/all
// @access  Public
const getAllMapAddresses = asyncHandler(async (req, res) => {
  // Get all map addresses and populate user information
  const mapAddresses = await MapAddress.find().populate('user', 'name email userType');

  res.status(200).json({
    success: true,
    count: mapAddresses.length,
    data: mapAddresses
  });
});

export { createOrUpdateMapAddress, getMapAddress, getAllMapAddresses };
