import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      match: [ /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: function() { return !this.googleId; },
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Password not selected by default
    },
    userType: {
      type: String,
      required: [true, 'Please specify your user type'],
      enum: ['Farmer', 'Buyer', 'Admin'],
      default: 'Farmer',
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// Hash password ONLY if it's provided and modified
userSchema.pre('save', async function (next) {
  console.log('[User.pre.save] Hook entered for user:', this.email);
  console.log('[User.pre.save] Is password modified?', this.isModified('password'));
  
  // Only hash the password if it has been modified (or is new) AND is actually present
  if (!this.isModified('password') || !this.password) {
    console.log('[User.pre.save] Skipping password hash. isModified:', this.isModified('password'), '|| hasPassword:', !!this.password);
    return next();
  }

  try {
    console.log('[User.pre.save] Hashing new password...');
    // console.log(`[User.pre.save] Password before hash (dev only): ${this.password}`); // Sensitive, use with caution
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    // console.log(`[User.pre.save] Password after hash (dev only): ${this.password}`); // Sensitive
    console.log('[User.pre.save] Password hashing complete.');
    next();
  } catch (error) {
    console.error('[User.pre.save] Error during password hashing:', error);
    next(error); // Pass error to Express error handler
  }
});

userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
  if (!userPassword) return false;
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;