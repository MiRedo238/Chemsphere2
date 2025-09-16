const pool = require('../config/database');
const { addAuditLog } = require('../utils/helpers');

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY name'
    );
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, name, role } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO users (email, name, role) VALUES (?, ?, ?)',
      [email, name, role || 'user']
    );
    
    const [newUser] = await pool.execute(
      'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = ?',
      [result.insertId]
    );
    
    await addAuditLog('user', 'add', name, req.user.id, {
      email, role: role || 'user'
    });
    
    res.status(201).json(newUser[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { email, name, role } = req.body;
    
    const [users] = await pool.execute(
      'SELECT name FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await pool.execute(
      'UPDATE users SET email = ?, name = ?, role = ? WHERE id = ?',
      [email, name, role, req.params.id]
    );
    
    const [updatedUser] = await pool.execute(
      'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = ?',
      [req.params.id]
    );
    
    await addAuditLog('user', 'update', name, req.user.id, {
      email, role
    });
    
    res.json(updatedUser[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT name, email FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting own account
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    
    await addAuditLog('user', 'delete', users[0].name, req.user.id, {
      email: users[0].email
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};