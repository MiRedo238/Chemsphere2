const pool = require('../config/database');

class AuditLog {
  static async create(logData) {
    const { type, action, item_name, user_id, details } = logData;
    
    const [result] = await pool.execute(
      `INSERT INTO audit_logs (type, action, item_name, user_id, details)
       VALUES (?, ?, ?, ?, ?)`,
      [type, action, item_name, user_id, JSON.stringify(details || {})]
    );
    
    return result.insertId;
  }

  static async findAll(filters = {}) {
    const { page = 1, limit = 50, type, action } = filters;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT al.*, u.name as user_name 
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
    `;
    let queryParams = [];
    
    const whereConditions = [];
    
    if (type) {
      whereConditions.push('al.type = ?');
      queryParams.push(type);
    }
    
    if (action) {
      whereConditions.push('al.action = ?');
      queryParams.push(action);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' ORDER BY al.timestamp DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);
    
    const [logs] = await pool.execute(query, queryParams);
    return logs;
  }

  static async findById(id) {
    const [logs] = await pool.execute(`
      SELECT al.*, u.name as user_name 
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      WHERE al.id = ?
    `, [id]);
    
    return logs[0];
  }

  static async getCount(filters = {}) {
    const { type, action } = filters;
    
    let query = 'SELECT COUNT(*) as total FROM audit_logs al';
    let queryParams = [];
    
    const whereConditions = [];
    
    if (type) {
      whereConditions.push('al.type = ?');
      queryParams.push(type);
    }
    
    if (action) {
      whereConditions.push('al.action = ?');
      queryParams.push(action);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    const [result] = await pool.execute(query, queryParams);
    return result[0].total;
  }
}

module.exports = AuditLog;