// routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

// 🔹 Start Google login
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 🔹 Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: process.env.FRONTEND_LOGIN_URL || '/login',
    successRedirect: process.env.FRONTEND_URL || 'http://localhost:5173',
  })
);

// 🔹 Current user info
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json(req.user);
  }
  res.status(401).json({ message: 'Not authenticated' });
});

// 🔹 Logout user
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);

    // Destroy session
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); // clear cookie in browser
      res.redirect(process.env.FRONTEND_LOGIN_URL || '/login');
    });
  });
});

module.exports = router;
