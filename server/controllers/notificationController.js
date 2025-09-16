const pool = require('../config/database');

exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, is_read } = req.query;
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
      queryParams.push(is_read === 'true');
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);
    
    const [notifications] = await pool.execute(query, queryParams);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [req.params.id]
    );
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE'
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications', error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await pool.execute('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
};