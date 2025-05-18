// backend/config/passport.js
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js'; // Ensure this path is correct to your User model
import dotenv from 'dotenv';

// Attempt to load .env relative to this file if not already loaded globally
// This helps if passport.js is initialized very early.
try {
    // Assuming .env is in the root of your 'backend' folder, and this file is in 'backend/config/'
    dotenv.config({ path: new URL('./../../.env', import.meta.url).pathname.substring(1) }); // Adjust path if needed, remove leading / for Windows
} catch (e) {
    console.warn("Could not load .env from passport.js, assuming it's loaded globally or not critical here (e.g., server.js loads it).", e.message);
}


export default function(passport) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
      console.error("PASSPORT FATAL ERROR: Google OAuth credentials or Callback URL missing. Check .env file.");
      // Optionally throw an error to prevent server startup if critical
      // throw new Error("Missing Google OAuth Credentials or Callback URL for Passport strategy");
      return; // Stop further execution if essentials are missing
  }
  console.log('Passport: Google Strategy Initializing...');
  console.log('  Client ID:', process.env.GOOGLE_CLIENT_ID ? 'OK' : 'MISSING');
  console.log('  Callback URL:', process.env.GOOGLE_CALLBACK_URL);


  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL, // This must match your Google Cloud Console URI
        scope: ['profile', 'email'] // Request access to user's profile and email
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log('Google Profile Data:', { id: profile.id, displayName: profile.displayName, email: profile.emails?.[0]?.value });

        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

        if (!email) {
           console.error('Google OAuth Error: Email not provided by Google profile.');
           return done(new Error('Email address not provided by Google. Please ensure your Google account has a primary email and permissions are granted.'), null);
        }

        const desiredUserType = 'Farmer'; // All Google sign-ins will be treated as/converted to Farmer

        try {
          // 1. Try to find user by googleId
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            console.log(`Found existing user by googleId: ${user.email}`);
            let updated = false;
            if (user.userType !== desiredUserType) {
              console.log(`Updating userType for ${user.email} from ${user.userType} to ${desiredUserType}`);
              user.userType = desiredUserType;
              updated = true;
            }
            // Optionally, update name if it has changed in Google profile
            if (profile.displayName && user.name !== profile.displayName) {
                console.log(`Updating name for ${user.email} from ${user.name} to ${profile.displayName}`);
                user.name = profile.displayName;
                updated = true;
            }
            if (updated) {
              await user.save();
              console.log(`User ${user.email} updated successfully.`);
            }
            return done(null, user);
          }

          // 2. If no user by googleId, try to find by email
          console.log(`No user found by googleId ${profile.id}. Checking by email: ${email}`);
          user = await User.findOne({ email: email });

          if (user) {
            console.log(`Found existing user by email: ${user.email}. Linking googleId and ensuring userType is Farmer.`);
            user.googleId = profile.id;
            user.userType = desiredUserType; // Force/update to Farmer
            if (profile.displayName && (!user.name || user.name !== profile.displayName)) {
                user.name = profile.displayName; // Update name if empty or different
            }
            // If this user signed up via standard email/password before, their password field will remain.
            // This is generally fine. They can now log in via Google or standard password.
            await user.save();
            console.log(`User ${user.email} (linked with Google) updated successfully.`);
            return done(null, user);
          }

          // 3. If no user by googleId or email, create a new user
          console.log(`No existing user found. Creating new Farmer user with Google details: ${email}`);
          const newUserDetails = {
            googleId: profile.id,
            name: profile.displayName || `User ${profile.id.slice(-5)}`, // Fallback name
            email: email,
            userType: desiredUserType,
            // Password field will be omitted, and our User model makes it optional if googleId exists
          };
          user = await User.create(newUserDetails);
          console.log(`New Farmer user created: ${user.email}`);
          return done(null, user);

        } catch (err) {
          console.error('Error during Google OAuth database operations:', err);
          return done(err, null); // Pass error to Passport
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
      try {
        const user = await User.findById(id);
        done(null, user);
      } catch (err) {
        console.error('Error deserializing user:', err);
        done(err, null);
      }
  });
}