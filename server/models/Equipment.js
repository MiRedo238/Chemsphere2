const pool = require('../config/database');

class Equipment {
  static async findAll() {
    const [equipment] = await pool.execute(`
      SELECT e.*, u.name as assigned_user_name,
        (SELECT COUNT(*) FROM equipment_maintenance_logs WHERE equipment_id = e.id) as maintenance_count
      FROM equipment e
      LEFT JOIN users u ON e.assigned_user_id = u.id
      ORDER BY e.name
    `);
    return equipment;
  }

  static async findById(id) {
    const [equipment] = await pool.execute(
      `SELECT e.*, u.name as assigned_user_name 
       FROM equipment e 
       LEFT JOIN users u ON e.assigned_user_id = u.id 
       WHERE e.id = ?`,
      [id]
    );
    
    if (equipment.length === 0) return null;
    
    const [logs] = await pool.execute(`
      SELECT eml.*, u.name as user_name 
      FROM equipment_maintenance_logs eml
      JOIN users u ON eml.user_id = u.id
      WHERE eml.equipment_id = ?
      ORDER BY eml.date DESC
    `, [id]);
    
    const equipmentItem = equipment[0];
    equipmentItem.maintenance_log = logs;
    
    return equipmentItem;
  }

  static async create(equipmentData) {
    const {
      name, model, serial_id, status, location, purchase_date,
      warranty_expiration, condition, assigned_user_id
    } = equipmentData;
    
    const today = new Date().toISOString().split('T')[0];
    const nextMaintenance = new Date();
    nextMaintenance.setMonth(nextMaintenance.getMonth() + 6);
    
    const [result] = await pool.execute(
      `INSERT INTO equipment 
       (name, model, serial_id, status, location, purchase_date,
        warranty_expiration, condition, last_maintenance, next_maintenance, assigned_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, model, serial_id, status || 'Available', location, purchase_date,
       warranty_expiration, condition || 'Good', today, nextMaintenance.toISOString().split('T')[0], 
       assigned_user_id || null]
    );
    
    return this.findById(result.insertId);
  }

  static async update(id, equipmentData) {
    const {
      name, model, serial_id, status, location, purchase_date,
      warranty_expiration, condition, assigned_user_id
    } = equipmentData;
    
    await pool.execute(
      `UPDATE equipment 
       SET name = ?, model = ?, serial_id = ?, status = ?, location = ?,
           purchase_date = ?, warranty_expiration = ?, condition = ?, assigned_user_id = ?
       WHERE id = ?`,
      [name, model, serial_id, status, location, purchase_date,
       warranty_expiration, condition, assigned_user_id, id]
    );
    
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM equipment WHERE id = ?', [id]);
    return true;
  }

  static async getMaintenanceLogs(equipmentId) {
    const [logs] = await pool.execute(`
      SELECT eml.*, u.name as user_name 
      FROM equipment_maintenance_logs eml
      JOIN users u ON eml.user_id = u.id
      WHERE eml.equipment_id = ?
      ORDER BY eml.date DESC
    `, [equipmentId]);
    
    return logs;
  }

  static async addMaintenanceLog(equipmentId, logData) {
    const { user_id, date, action, notes } = logData;
    
    const [result] = await pool.execute(
      `INSERT INTO equipment_maintenance_logs 
       (equipment_id, user_id, date, action, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [equipmentId, user_id, date, action, notes || '']
    );
    
    return result.insertId;
  }
}

module.exports = Equipment;