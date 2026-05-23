import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';
import { generateTokenPair } from '../utils/auth.js';

export function initPassport(passport) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (clientID && clientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID,
          clientSecret,
          callbackURL: '/api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const existing = await User.findOne({ email });
            if (existing) {
              return done(null, existing);
            }

            const user = await User.create({
              name: profile.displayName,
              email,
              role: 'customer',
              avatar: profile.photos?.[0]?.value,
              authProvider: 'google'
            });
            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  } else {
    // If Google credentials are not provided, skip strategy registration.
    // This allows the app to run in local/dev without OAuth config.
    // eslint-disable-next-line no-console
    console.warn('Google OAuth not configured. Skipping GoogleStrategy.');
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}
