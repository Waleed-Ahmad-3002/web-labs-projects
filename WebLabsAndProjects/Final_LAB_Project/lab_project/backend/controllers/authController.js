import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from 'express-async-handler';
import sendEmail from '../utils/sendEmail.js'; // Your sendEmail utility
import crypto from 'crypto';

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signupUser = asyncHandler(async (req, res) => {
  const { name, email, password, userType } = req.body;

  if (!name || !email || !password || !userType) {
    res.status(400);
    throw new Error('Please provide all required fields: name, email, password, userType');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    userType,
  });

  if (user) {
    const token = generateToken(user._id);

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      token: token, // Sending token in response body for frontend localStorage
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password'); // Explicitly select password

  if (user && (await user.comparePassword(password, user.password))) {
    const token = generateToken(user._id);

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      token: token, // Also sending token in response body
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private (user must be logged in - ensure 'protect' middleware is used on this route if it's not already)
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0), // Set cookie to expire immediately
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Forgot password - Get reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address.');
  }

  const user = await User.findOne({ email });

  if (!user) {
    // To prevent email enumeration, send a generic success message.
    console.log(`[ForgotPassCtrl] Password reset requested for non-existent email: ${email}`);
    res.status(200).json({ message: 'If an account with this email exists, a password reset link has been sent.' });
    return;
  }
  console.log(`[ForgotPassCtrl] User found for password reset: ${user.email}`);

  const resetToken = user.createPasswordResetToken(); // Method from User model
  await user.save({ validateBeforeSave: false }); // Save the hashed token and expiry on the user document
  console.log(`[ForgotPassCtrl] Reset token generated and user saved with hashed token.`);

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`; // Unhashed token in URL

  const plainTextMessage = `
    Hi ${user.name},

    You are receiving this email because you (or someone else) have requested the reset of a password for your AgriConnect account.
    Please click on the following link, or paste this into your browser to complete the process:
    ${resetUrl}

    This link will expire in 10 minutes.
    If you did not request this, please ignore this email and your password will remain unchanged.

    Thanks,
    The AgriConnect Team
  `;

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <p>Hi ${user.name},</p>
      <p>You are receiving this email because you (or someone else) have requested the reset of a password for your AgriConnect account.</p>
      <p>Please click on the following link to complete the process:</p>
      <p><a href="${resetUrl}" target="_blank" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Your Password</a></p>
      <p>Alternatively, you can copy and paste the following URL into your browser:</p>
      <p><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
      <p>This link will expire in <strong>10 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <br>
      <p>Thanks,<br>The AgriConnect Team</p>
    </div>
  `;

  try {
    console.log(`[ForgotPassCtrl] Attempting to send password reset email to ${user.email}`);
    await sendEmail({
      to: user.email,      // Ensure this matches your sendEmail.js options
      subject: 'Your AgriConnect Password Reset Token (Valid for 10 Minutes)',
      text: plainTextMessage, // Ensure this matches your sendEmail.js options
      html: htmlMessage,   // Ensure this matches your sendEmail.js options
    });
    console.log(`[ForgotPassCtrl] Password reset email sent successfully to ${user.email}`);
    res.status(200).json({ message: 'Password reset link has been sent to your email.' });
  } catch (err) {
    console.error("[ForgotPassCtrl] Error sending password reset email:", err);
    // Clear the token fields if email sending fails to allow user to try again without waiting for expiry
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(`[ForgotPassCtrl] Cleared reset token for ${user.email} due to email sending failure.`);
    
    res.status(500);
    // Use the error message from your sendEmail utility or a more generic one
    throw new Error(err.message || 'There was an error sending the password reset email. Please try again later.');
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token: resetTokenFromParams } = req.params;

  console.log('[ResetPasswordCtrl] Received reset request. Token from params:', resetTokenFromParams);
  console.log('[ResetPasswordCtrl] Body:', { password: password ? 'Exists' : 'Missing', confirmPassword: confirmPassword ? 'Exists' : 'Missing' });


  if (!password || !confirmPassword) {
    console.log('[ResetPasswordCtrl] Validation fail: Missing password or confirmPassword.');
    res.status(400);
    throw new Error('Please provide new password and confirm password.');
  }

  if (password !== confirmPassword) {
    console.log('[ResetPasswordCtrl] Validation fail: Passwords do not match.');
    res.status(400);
    throw new Error('Passwords do not match.');
  }
  
  if (password.length < 6) {
    console.log('[ResetPasswordCtrl] Validation fail: Password too short.');
    res.status(400);
    throw new Error('Password must be at least 6 characters long.');
  }

  // Hash the token from the params to compare with the stored hashed token
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetTokenFromParams)
    .digest('hex');
  console.log('[ResetPasswordCtrl] Hashed token for DB query:', hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // Check if token is not expired
  }).select('+password'); // Explicitly select password field for modification

  if (!user) {
    console.log('[ResetPasswordCtrl] User not found with this token or token expired.');
    res.status(400);
    throw new Error('Token is invalid or has expired. Please request a new password reset.');
  }
  console.log('[ResetPasswordCtrl] User found:', user.email);

  // Set the new password
  user.password = password; // The pre-save hook in User.js should hash it
  console.log(`[ResetPasswordCtrl] Assigned new password to user object. Is 'password' path modified? ${user.isModified('password')}`);

  user.passwordResetToken = undefined; // Clear the reset token fields
  user.passwordResetExpires = undefined;
  console.log('[ResetPasswordCtrl] Cleared passwordResetToken and passwordResetExpires.');

  try {
    console.log('[ResetPasswordCtrl] Attempting to save user...');
    await user.save(); // This will trigger the pre-save hook
    console.log('[ResetPasswordCtrl] user.save() completed successfully for user:', user.email);
    
    // Successfully saved
    res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });

  } catch (saveError) {
    console.error('[ResetPasswordCtrl] Error during user.save():', saveError);
    res.status(500);
    throw new Error('Could not update password due to a server error. Please try again.');
  }
});


export { signupUser, loginUser, logoutUser, forgotPassword, resetPassword };