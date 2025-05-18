import asyncHandler from 'express-async-handler';
import MarketPrice from '../../models/farmer/MarketPrice.js';

// @desc    Get all market prices for the logged-in farmer
// @route   GET /api/farmer/marketprices
// @access  Private (Farmer only)
const getMarketPrices = asyncHandler(async (req, res) => {
  const prices = await MarketPrice.find({ farmer: req.user._id }).sort({ updatedAt: -1 }); // Sort by most recently updated
  res.json(prices);
});

// @desc    Create a new market price entry
// @route   POST /api/farmer/marketprices
// @access  Private (Farmer only)
const createMarketPrice = asyncHandler(async (req, res) => {
  const { crop, price, unit, source, notes } = req.body;

  if (!crop || price === undefined || !unit) {
    res.status(400);
    throw new Error('Crop name, price, and unit are required');
  }
  if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    res.status(400);
    throw new Error('Price must be a valid positive number');
  }


  const marketPrice = new MarketPrice({
    farmer: req.user._id,
    crop,
    price: parseFloat(price),
    unit,
    source,
    notes,
  });

  const createdMarketPrice = await marketPrice.save();
  res.status(201).json(createdMarketPrice);
});

// @desc    Update an existing market price entry
// @route   PUT /api/farmer/marketprices/:id
// @access  Private (Farmer only)
const updateMarketPrice = asyncHandler(async (req, res) => {
  const { crop, price, unit, source, notes } = req.body;

  const marketPrice = await MarketPrice.findById(req.params.id);

  if (marketPrice) {
    if (marketPrice.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this price entry');
    }

    if (price !== undefined && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
        res.status(400);
        throw new Error('Price must be a valid positive number');
    }

    marketPrice.crop = crop || marketPrice.crop;
    marketPrice.price = price !== undefined ? parseFloat(price) : marketPrice.price;
    marketPrice.unit = unit || marketPrice.unit;
    marketPrice.source = source !== undefined ? source : marketPrice.source;
    marketPrice.notes = notes !== undefined ? notes : marketPrice.notes;
    // `updatedAt` will be automatically updated by Mongoose timestamps

    const updatedMarketPrice = await marketPrice.save();
    res.json(updatedMarketPrice);
  } else {
    res.status(404);
    throw new Error('Market price entry not found');
  }
});

// @desc    Delete a market price entry
// @route   DELETE /api/farmer/marketprices/:id
// @access  Private (Farmer only)
const deleteMarketPrice = asyncHandler(async (req, res) => {
  const marketPrice = await MarketPrice.findById(req.params.id);

  if (marketPrice) {
    if (marketPrice.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this price entry');
    }
    await MarketPrice.deleteOne({ _id: req.params.id });
    res.json({ message: 'Market price entry removed' });
  } else {
    res.status(404);
    throw new Error('Market price entry not found');
  }
});

export {
  getMarketPrices,
  createMarketPrice,
  updateMarketPrice,
  deleteMarketPrice,
};