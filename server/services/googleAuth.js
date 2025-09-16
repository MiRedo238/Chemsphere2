const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../config/database');

const configureGoogleAuth = () => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      const [users] = await pool.execute(
        'SELECT * FROM users WHERE google_id = ? OR email = ?',
        [profile.id, profile.emails[0].value]
      );
      
      if (users.length > 0) {
        // Update google_id if missing
        if (!users[0].google_id) {
          await pool.execute(
            'UPDATE users SET google_id = ? WHERE id = ?',
            [profile.id, users[0].id]
          );
        }
        return done(null, users[0]);
      } else {
        // Create new user (default role is user)
        const [result] = await pool.execute(
          'INSERT INTO users (google_id, email, name, role) VALUES (?, ?, ?, ?)',
          [profile.id, profile.emails[0].value, profile.displayName, 'user']
        );
        
        const [newUser] = await pool.execute(
          'SELECT * FROM users WHERE id = ?',
          [result.insertId]
        );
        
        return done(null, newUser[0]);
      }
    } catch (error) {
      return done(error, null);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const [users] = await pool.execute(
        'SELECT id, email, name, role FROM users WHERE id = ?',
        [id]
      );
      done(null, users[0]);
    } catch (error) {
      done(error, null);
    }
  });
};

module.exports = configureGoogleAuth;