import asyncHandler from 'express-async-handler';
import ProductListing from '../../models/farmer/ProductListing.js';
import User from '../../models/User.js'; // For banning users

// @desc    Get all product listings for admin (all statuses)
// @route   GET /api/admin/marketplace/listings
// @access  Private (Admin only)
const getAllListingsForAdmin = asyncHandler(async (req, res) => {
  const listings = await ProductListing.find({})
    .populate('farmer', 'name email userType') // Populate farmer info
    .sort({ createdAt: -1 });
  res.json(listings);
});

// @desc    Update a product listing (e.g., status, details) by Admin
// @route   PUT /api/admin/marketplace/listings/:id
// @access  Private (Admin only)
const updateListingByAdmin = asyncHandler(async (req, res) => {
  const { productName, category, price, quantity, unit, status, reported, reportDetails } = req.body;
  const listing = await ProductListing.findById(req.params.id);

  if (listing) {
    listing.productName = productName !== undefined ? productName : listing.productName;
    listing.category = category !== undefined ? category : listing.category;
    listing.pricePerUnit = price !== undefined ? parseFloat(price) : listing.pricePerUnit;
    listing.quantity = quantity !== undefined ? parseFloat(quantity) : listing.quantity;
    listing.unit = unit !== undefined ? unit : listing.unit;
    listing.status = status !== undefined ? status : listing.status;
    listing.reported = reported !== undefined ? reported : listing.reported;
    listing.reportDetails = reportDetails !== undefined ? reportDetails : listing.reportDetails;

    if (listing.pricePerUnit !== undefined && (isNaN(listing.pricePerUnit) || listing.pricePerUnit < 0)) {
        res.status(400); throw new Error('Price must be a valid non-negative number.');
    }
    if (listing.quantity !== undefined && (isNaN(listing.quantity) || listing.quantity < 0)) {
        res.status(400); throw new Error('Quantity must be a valid non-negative number.');
    }

    const updatedListing = await listing.save();
    res.json(updatedListing);
  } else {
    res.status(404);
    throw new Error('Listing not found');
  }
});

// @desc    Admin "soft removes" a listing (sets status to 'Removed')
// @route   DELETE /api/admin/marketplace/listings/:id
// @access  Private (Admin only)
const removeListingByAdmin = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const listing = await ProductListing.findById(req.params.id);

    if (listing) {
        listing.status = 'Removed';
        listing.reportDetails = reason ? `Admin Removal: ${reason}` : (listing.reportDetails || 'Removed by Admin');
        listing.reported = false;
        const updatedListing = await listing.save();
        res.json(updatedListing);
    } else {
        res.status(404);
        throw new Error('Listing not found');
    }
});

// @desc    Permanently delete a product listing by Admin
// @route   DELETE /api/admin/marketplace/listings/:id/permanent-delete
// @access  Private (Admin only)
const permanentlyDeleteListingByAdmin = asyncHandler(async (req, res) => {
  const listing = await ProductListing.findById(req.params.id);

  if (listing) {
    await ProductListing.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product listing permanently deleted' });
  } else {
    res.status(404);
    throw new Error('Listing not found');
  }
});


// @desc    Ban a farmer (update user status and their active listings)
// @route   PUT /api/admin/marketplace/users/:farmerId/ban  (Note: The route in marketplaceAdminRoutes.js should match this if it's here)
// @access  Private (Admin only)
const banFarmer = asyncHandler(async (req, res) => {
    const farmerId = req.params.farmerId;
    const farmer = await User.findById(farmerId);

    if (!farmer) {
        res.status(404);
        throw new Error('Farmer not found');
    }
    if (farmer.userType !== 'Farmer') {
        res.status(400);
        throw new Error('User is not a Farmer');
    }

    // Assuming User model has 'isBanned' field
    // farmer.isBanned = true;
    // Or a status field:
    farmer.status = 'banned'; // Ensure your User model supports this or add 'isBanned'
    await farmer.save();

    await ProductListing.updateMany(
        { farmer: farmerId, status: { $in: ['active', 'Pending Approval'] } },
        { $set: { status: 'Removed', reportDetails: 'Farmer account banned by admin.' } }
    );

    res.json({ message: `Farmer ${farmer.name} banned and their listings updated.` });
});


export {
  getAllListingsForAdmin,
  updateListingByAdmin,
  removeListingByAdmin,         // This is for soft removal (status change)
  banFarmer,
  permanentlyDeleteListingByAdmin, // <<< ADDED TO EXPORTS
};