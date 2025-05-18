const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes and verify authentication
const protect = async (req, res, next) => {
    try {
        // 1. Token Extraction
        // Check if authorization header exists and starts with 'Bearer'
        let token;
        if (req.headers.authorization && 
            req.headers.authorization.startsWith('Bearer')) {
            // Extract the token (second part after 'Bearer ')
            token = req.headers.authorization.split(' ')[1];
        }

        // 2. Token Existence Check
        // If no token is present, deny access
        if (!token) {
            return res.status(401).json({ 
                message: 'Not authorized, no token provided',
                status: 'error'
            });
        }

        // 3. Token Verification
        // Decode and verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. User Existence Verification
        // Check if the user associated with the token still exists in the database
        const currentUser = await User.findById(decoded.id);
        
        // If user no longer exists, deny access
        if (!currentUser) {
            return res.status(401).json({ 
                message: 'User associated with this token no longer exists',
                status: 'error'
            });
        }

        // 5. Role-Based Access Control (Optional but Recommended)
        // You can add additional checks based on user roles if needed
        // Example:
        // if (requiredRole && currentUser.role !== requiredRole) {
        //     return res.status(403).json({ 
        //         message: 'Insufficient permissions',
        //         status: 'error'
        //     });
        // }

        // 6. Attach User to Request
        // Add the current user to the request object for further use in route handlers
        req.user = currentUser;

        // 7. Proceed to Next Middleware/Route Handler
        next();

    } catch (error) {
        // Error Handling for Token Verification
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Invalid token',
                status: 'error'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expired. Please log in again.',
                status: 'error'
            });
        }

        // Generic error response
        res.status(401).json({
            message: 'Not authorized to access this route',
            error: error.message,
            status: 'error'
        });
    }
};

// Middleware to check specific user roles
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // Check if user exists and has appropriate role
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'You do not have permission to perform this action',
                status: 'error'
            });
        }
        next();
    };
};

module.exports = {
    protect,
    restrictTo
};