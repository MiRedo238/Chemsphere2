const pool = require('../config/database');

exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, action } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT al.*, u.name as user_name 
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM audit_logs al';
    let queryParams = [];
    let countParams = [];
    
    const whereConditions = [];
    
    if (type) {
      whereConditions.push('al.type = ?');
      queryParams.push(type);
      countParams.push(type);
    }
    
    if (action) {
      whereConditions.push('al.action = ?');
      queryParams.push(action);
      countParams.push(action);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
      countQuery += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' ORDER BY al.timestamp DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);
    
    const [logs] = await pool.execute(query, queryParams);
    const [totalCount] = await pool.execute(countQuery, countParams);
    
    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].total,
        pages: Math.ceil(totalCount[0].total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
};

exports.getAuditLogById = async (req, res) => {
  try {
    const [logs] = await pool.execute(`
      SELECT al.*, u.name as user_name 
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      WHERE al.id = ?
    `, [req.params.id]);
    
    if (logs.length === 0) {
      return res.status(404).json({ message: 'Audit log not found' });
    }
    
    res.json(logs[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit log', error: error.message });
  }
};