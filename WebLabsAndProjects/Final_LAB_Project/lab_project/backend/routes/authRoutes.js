import express from 'express';
import passport from 'passport';
import {
  signupUser,
  loginUser,
  logoutUser,
  forgotPassword, // Import new controller
  resetPassword,  // Import new controller
} from '../controllers/authController.js';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

// Standard Authentication Routes
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser); // Consider protecting this route

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);


// --- Google OAuth Routes ---
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed&message=Authentication_with_Google_failed`,
        failureMessage: true,
        session: false
    }),
    (req, res) => {
        if (!req.user) {
            console.error("Google OAuth Callback: req.user is undefined after successful authentication.");
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_error&message=User_details_not_found_after_Google_auth`);
        }
        const token = generateToken(req.user._id);
        const userForFrontend = {
            _id: req.user._id.toString(),
            name: req.user.name,
            email: req.user.email,
            userType: req.user.userType,
            token: token
        };
        const queryParams = new URLSearchParams(userForFrontend).toString();
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        console.log(`Redirecting to frontend callback: ${frontendUrl}/auth/google/callback with token and user data.`);
        res.redirect(`${frontendUrl}/auth/google/callback?${queryParams}`);
    }
);

export default router;