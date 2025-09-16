const pool = require('../config/database');

class Chemical {
  static async findAll() {
    const [chemicals] = await pool.execute(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM chemical_usage_logs WHERE chemical_id = c.id) as usage_count
      FROM chemicals c
      ORDER BY c.name
    `);
    return chemicals;
  }

  static async findById(id) {
    const [chemicals] = await pool.execute(
      'SELECT * FROM chemicals WHERE id = ?',
      [id]
    );
    
    if (chemicals.length === 0) return null;
    
    const [logs] = await pool.execute(`
      SELECT cul.*, u.name as user_name 
      FROM chemical_usage_logs cul
      JOIN users u ON cul.user_id = u.id
      WHERE cul.chemical_id = ?
      ORDER BY cul.date DESC
    `, [id]);
    
    const chemical = chemicals[0];
    chemical.usage_log = logs;
    
    return chemical;
  }

  static async create(chemicalData) {
    const {
      name, batch_number, brand, volume, initial_quantity, current_quantity,
      expiration_date, date_of_arrival, safety_class, location, ghs_symbols
    } = chemicalData;
    
    const [result] = await pool.execute(
      `INSERT INTO chemicals 
       (name, batch_number, brand, volume, initial_quantity, current_quantity,
        expiration_date, date_of_arrival, safety_class, location, ghs_symbols)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, batch_number, brand, volume, initial_quantity, current_quantity,
       expiration_date, date_of_arrival, safety_class, location, JSON.stringify(ghs_symbols)]
    );
    
    return this.findById(result.insertId);
  }

  static async update(id, chemicalData) {
    const {
      name, batch_number, brand, volume, initial_quantity, current_quantity,
      expiration_date, date_of_arrival, safety_class, location, ghs_symbols
    } = chemicalData;
    
    await pool.execute(
      `UPDATE chemicals 
       SET name = ?, batch_number = ?, brand = ?, volume = ?, initial_quantity = ?, 
           current_quantity = ?, expiration_date = ?, date_of_arrival = ?, 
           safety_class = ?, location = ?, ghs_symbols = ?
       WHERE id = ?`,
      [name, batch_number, brand, volume, initial_quantity, current_quantity,
       expiration_date, date_of_arrival, safety_class, location, 
       JSON.stringify(ghs_symbols), id]
    );
    
    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM chemicals WHERE id = ?', [id]);
    return true;
  }

  static async getUsageLogs(chemicalId) {
    const [logs] = await pool.execute(`
      SELECT cul.*, u.name as user_name 
      FROM chemical_usage_logs cul
      JOIN users u ON cul.user_id = u.id
      WHERE cul.chemical_id = ?
      ORDER BY cul.date DESC
    `, [chemicalId]);
    
    return logs;
  }

  static async addUsageLog(chemicalId, logData) {
    const { user_id, date, location, quantity, notes, opened } = logData;
    
    const [result] = await pool.execute(
      `INSERT INTO chemical_usage_logs 
       (chemical_id, user_id, date, location, quantity, notes, opened)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [chemicalId, user_id, date, location, quantity, notes, opened || false]
    );
    
    // Update chemical quantity
    await pool.execute(
      'UPDATE chemicals SET current_quantity = current_quantity - ? WHERE id = ?',
      [quantity, chemicalId]
    );
    
    return result.insertId;
  }
}

module.exports = Chemical;