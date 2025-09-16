const pool = require('../config/database');

class User {
  static async findByEmail(email) {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return users[0];
  }

  static async findById(id) {
    const [users] = await pool.execute(
      'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return users[0];
  }

  static async create(userData) {
    const { google_id, email, name, role = 'user' } = userData;
    const [result] = await pool.execute(
      'INSERT INTO users (google_id, email, name, role) VALUES (?, ?, ?, ?)',
      [google_id, email, name, role]
    );
    return this.findById(result.insertId);
  }

  static async update(id, userData) {
    const { email, name, role } = userData;
    await pool.execute(
      'UPDATE users SET email = ?, name = ?, role = ? WHERE id = ?',
      [email, name, role, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }

  static async findAll() {
    const [users] = await pool.execute(
      'SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY name'
    );
    return users;
  }
}

module.exports = User;