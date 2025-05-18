import asyncHandler from 'express-async-handler';
import User from '../../models/User.js';
import CropPlan from '../../models/farmer/CropPlan.js';
import ProductListing from '../../models/farmer/ProductListing.js'; // For listing counts

// @desc    Get all non-admin users for admin view with aggregated data
// @route   GET /api/admin/users/all
// @access  Private (Admin only)
const getAllUsersForAdmin = asyncHandler(async (req, res) => {
    // Fetch only 'Farmer' and 'Buyer' users, exclude password
    const users = await User.find({ userType: { $in: ['Farmer', 'Buyer'] } })
        .select('-password') // Exclude password
        .sort({ createdAt: -1 }) // Sort by creation date, newest first
        .lean(); // Use .lean() for plain JS objects, good for performance if not saving back

    // Aggregate additional data for each user
    // For better performance on large datasets, consider MongoDB aggregation framework for these counts.
    // For now, this approach is simpler for fewer users.
    const usersWithAggregatedData = await Promise.all(users.map(async (user) => {
        let cropPlansCount = 0;
        let productListingsCount = 0; // Example: adding product listing count

        if (user.userType === 'Farmer') {
            try {
                cropPlansCount = await CropPlan.countDocuments({ farmer: user._id });
                productListingsCount = await ProductListing.countDocuments({ farmer: user._id, status: 'active' });
            } catch (countError) {
                console.error(`Error counting data for farmer ${user.name} (${user._id}):`, countError);
            }
        }
        return {
            ...user, // Spread existing user properties
            userId: user._id, // Ensure userId is present if frontend expects it
            userName: user.name, // Ensure userName is present
            cropPlansCount,
            productListingsCount, // Add new aggregated data
            // Add other relevant counts like activeTasksCount etc. if needed
        };
    }));

    res.json(usersWithAggregatedData);
});

export {
    getAllUsersForAdmin,
};