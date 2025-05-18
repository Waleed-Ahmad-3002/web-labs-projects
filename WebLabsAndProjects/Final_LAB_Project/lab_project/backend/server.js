import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';       // For Passport
import passport from 'passport';           // For Passport
import connectDB from './config/db.js';
import initializePassportConfig from './config/passport.js'; // Your Passport config

// Import all route handlers
import authRoutes from './routes/authRoutes.js';
import cropPlanRoutes from './routes/farmer/cropPlanRoutes.js';
import farmTaskRoutes from './routes/farmer/farmTaskRoutes.js';
import marketPriceRoutes from './routes/farmer/marketPriceRoutes.js';
import financialTransactionRoutes from './routes/farmer/financialTransactionRoutes.js';
import farmerProductListingRoutes from './routes/farmer/productListingRoutes.js';
import marketplaceListingRoutes from './routes/marketplace/listingRoutes.js';
import adminMarketplaceRoutes from './routes/admin/marketplaceAdminRoutes.js';
import adminCommunicationRoutes from './routes/admin/communicationRoutes.js';
import adminUserRoutes from './routes/admin/userAdminRoutes.js';
import mapAddressRoutes from './routes/mapAddressRoutes.js';

// Import middleware
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();
connectDB();
initializePassportConfig(passport); // Initialize Passport configuration

const app = express();

// CORS Configuration
const allowedOrigins = ['http://localhost:5173'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin ${origin} not allowed.`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

// Apply CORS middleware to all routes.
// This should handle preflight (OPTIONS) requests for the routes defined below.
app.use(cors(corsOptions));
// REMOVED: app.options('*', cors(corsOptions)); // Removed this line


// Express Session Middleware (Must come BEFORE passport middleware)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    }
  })
);

// Passport Middleware
app.use(passport.initialize());
// app.use(passport.session()); // Optional: Only if using Passport's session strategy for persistent logins beyond OAuth

// Standard Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- MOUNT ROUTERS ---
app.use('/api/auth', authRoutes); // Google OAuth routes are in here
app.use('/api/farmer/cropplans', cropPlanRoutes);
app.use('/api/farmer/tasks', farmTaskRoutes);
app.use('/api/farmer/marketprices', marketPriceRoutes);
app.use('/api/farmer/financials', financialTransactionRoutes);
app.use('/api/farmer/listings', farmerProductListingRoutes);
app.use('/api/marketplace/listings', marketplaceListingRoutes);
app.use('/api/admin/marketplace', adminMarketplaceRoutes);
app.use('/api/admin/communication', adminCommunicationRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/mapaddress', mapAddressRoutes);

// --- ERROR HANDLING ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});