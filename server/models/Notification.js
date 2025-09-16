const pool = require('../config/database');

class Notification {
  static async create(notificationData) {
    const { type, title, message, item_type, item_id } = notificationData;
    
    const [result] = await pool.execute(
      `INSERT INTO notifications (type, title, message, item_type, item_id)
       VALUES (?, ?, ?, ?, ?)`,
      [type, title, message, item_type, item_id || null]
    );
    
    return result.insertId;
  }

  static async findAll(filters = {}) {
    const { page = 1, limit = 20, is_read } = filters;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT n.*, 
        CASE 
          WHEN n.item_type = 'chemical' THEN c.name
          WHEN n.item_type = 'equipment' THEN e.name
          ELSE NULL
        END as item_name
      FROM notifications n
      LEFT JOIN chemicals c ON n.item_type = 'chemical' AND n.item_id = c.id
      LEFT JOIN equipment e ON n.item_type = 'equipment' AND n.item_id = e.id
    `;
    let queryParams = [];
    
    const whereConditions = [];
    
    if (is_read !== undefined) {
      whereConditions.push('n.is_read = ?');
      queryParams.push(is_read);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);
    
    const [notifications] = await pool.execute(query, queryParams);
    return notifications;
  }

  static async markAsRead(id) {
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [id]
    );
    
    return true;
  }

  static async markAllAsRead() {
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE'
    );
    
    return true;
  }

  static async delete(id) {
    await pool.execute('DELETE FROM notifications WHERE id = ?', [id]);
    return true;
  }

  static async getUnreadCount() {
    const [result] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE is_read = FALSE'
    );
    
    return result[0].count;
  }
}

module.exports = Notification;