const pool = require('../config/database');
const passport = require('passport');
const jwt = require('jsonwebtoken');

exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

exports.googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', (err, user) => {
    if (err) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=login_failed`);
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
};

exports.verifyToken = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [users] = await pool.execute(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [decoded.id]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    res.json({ valid: true, user: users[0] });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};