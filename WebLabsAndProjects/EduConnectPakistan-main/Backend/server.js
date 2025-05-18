const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
// Middleware
app.use(cors(corsOptions));// Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Add this after your auth routes in server.js
const tutorRoutes = require('./routes/tutorroutes');
app.use('/api/tutor', tutorRoutes);

const userRoutes = require('./routes/userroutes');
app.use('/api/users', userRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const wishlistRoutes = require('./routes/wishlistRoutes');
app.use('/api/student', wishlistRoutes);

const availroutes = require('./routes/availroutes');
app.use('/api/availability', availroutes);

const sessionRoutes = require('./routes/sessionRoutes');
app.use('/api/sessions', sessionRoutes);


const reviewRoutes = require('./routes/reviewRoutes');

// Add this with your other route configurations
app.use('/api/reviews', reviewRoutes);


const reportRoutes = require('./routes/reportRoutes');
app.use('/api/admin/reports', reportRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;