const pool = require('../config/database');
const { addAuditLog } = require('../utils/helpers');

exports.getAllEquipment = async (req, res) => {
  try {
    const [equipment] = await pool.execute(`
      SELECT e.*, u.name as assigned_user_name,
        (SELECT COUNT(*) FROM equipment_maintenance_logs WHERE equipment_id = e.id) as maintenance_count
      FROM equipment e
      LEFT JOIN users u ON e.assigned_user_id = u.id
      ORDER BY e.name
    `);
    
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching equipment', error: error.message });
  }
};

exports.getEquipmentById = async (req, res) => {
  try {
    const [equipment] = await pool.execute(
      `SELECT e.*, u.name as assigned_user_name 
       FROM equipment e 
       LEFT JOIN users u ON e.assigned_user_id = u.id 
       WHERE e.id = ?`,
      [req.params.id]
    );
    
    if (equipment.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    const [logs] = await pool.execute(`
      SELECT eml.*, u.name as user_name 
      FROM equipment_maintenance_logs eml
      JOIN users u ON eml.user_id = u.id
      WHERE eml.equipment_id = ?
      ORDER BY eml.date DESC
    `, [req.params.id]);
    
    const equipmentItem = equipment[0];
    equipmentItem.maintenance_log = logs;
    
    res.json(equipmentItem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching equipment', error: error.message });
  }
};

exports.createEquipment = async (req, res) => {
  try {
    const {
      name, model, serial_id, status, location, purchase_date,
      warranty_expiration, condition, assigned_user_id
    } = req.body;
    
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
    
    const [newEquipment] = await pool.execute(
      `SELECT e.*, u.name as assigned_user_name 
       FROM equipment e 
       LEFT JOIN users u ON e.assigned_user_id = u.id 
       WHERE e.id = ?`,
      [result.insertId]
    );
    
    await addAuditLog('equipment', 'add', name, req.user.id, {
      serial_id, model, status
    });
    
    res.status(201).json(newEquipment[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating equipment', error: error.message });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const {
      name, model, serial_id, status, location, purchase_date,
      warranty_expiration, condition, assigned_user_id
    } = req.body;
    
    await pool.execute(
      `UPDATE equipment 
       SET name = ?, model = ?, serial_id = ?, status = ?, location = ?,
           purchase_date = ?, warranty_expiration = ?, condition = ?, assigned_user_id = ?
       WHERE id = ?`,
      [name, model, serial_id, status, location, purchase_date,
       warranty_expiration, condition, assigned_user_id, req.params.id]
    );
    
    const [equipment] = await pool.execute(
      `SELECT e.*, u.name as assigned_user_name 
       FROM equipment e 
       LEFT JOIN users u ON e.assigned_user_id = u.id 
       WHERE e.id = ?`,
      [req.params.id]
    );
    
    await addAuditLog('equipment', 'update', name, req.user.id, {
      serial_id, status
    });
    
    res.json(equipment[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating equipment', error: error.message });
  }
};

exports.deleteEquipment = async (req, res) => {
  try {
    const [equipment] = await pool.execute(
      'SELECT name, serial_id FROM equipment WHERE id = ?',
      [req.params.id]
    );
    
    if (equipment.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    await pool.execute('DELETE FROM equipment WHERE id = ?', [req.params.id]);
    
    await addAuditLog('equipment', 'delete', equipment[0].name, req.user.id, {
      serial_id: equipment[0].serial_id
    });
    
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting equipment', error: error.message });
  }
};

exports.logEquipmentUsage = async (req, res) => {
  try {
    const { equipment_id, date, action, notes } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO equipment_maintenance_logs 
       (equipment_id, user_id, date, action, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [equipment_id, req.user.id, date, action, notes || '']
    );
    
    const [equipment] = await pool.execute(
      'SELECT name FROM equipment WHERE id = ?',
      [equipment_id]
    );
    
    await addAuditLog('equipment', action.toLowerCase(), equipment[0].name, req.user.id, {
      action, date, notes
    });
    
    res.status(201).json({ message: 'Usage logged successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging usage', error: error.message });
  }
};