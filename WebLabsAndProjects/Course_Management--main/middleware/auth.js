// auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Make sure username is included in the decoded token
        if (!decoded.username) {
            return res.status(400).json({ message: 'Invalid token: username missing' });
        }
        
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = auth;