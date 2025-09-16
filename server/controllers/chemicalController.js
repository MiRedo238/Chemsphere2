const pool = require('../config/database');
const { addAuditLog } = require('../utils/helpers');

// Get all chemicals
const getAllChemicals = async (req, res) => {
  try {
    const [chemicals] = await pool.execute(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM chemical_usage_logs WHERE chemical_id = c.id) as usage_count
      FROM chemicals c
      ORDER BY c.name
    `);
    
    res.json(chemicals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chemicals', error: error.message });
  }
};

// Get chemical by ID
const getChemicalById = async (req, res) => {
  try {
    const [chemicals] = await pool.execute(
      'SELECT * FROM chemicals WHERE id = ?',
      [req.params.id]
    );
    
    if (chemicals.length === 0) {
      return res.status(404).json({ message: 'Chemical not found' });
    }
    
    // Get usage logs
    const [logs] = await pool.execute(`
      SELECT cul.*, u.name as user_name 
      FROM chemical_usage_logs cul
      JOIN users u ON cul.user_id = u.id
      WHERE cul.chemical_id = ?
      ORDER BY cul.date DESC
    `, [req.params.id]);
    
    const chemical = chemicals[0];
    chemical.usageLog = logs;
    
    res.json(chemical);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chemical', error: error.message });
  }
};

// Create new chemical
const createChemical = async (req, res) => {
  try {
    const {
      name, batchNumber, brand, volume, initialQuantity, currentQuantity,
      expirationDate, dateOfArrival, safetyClass, location, ghsSymbols
    } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO chemicals 
       (name, batch_number, brand, volume, initial_quantity, current_quantity, 
        expiration_date, date_of_arrival, safety_class, location, ghs_symbols)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, batchNumber, brand, volume, initialQuantity, currentQuantity,
       expirationDate, dateOfArrival, safetyClass, location, JSON.stringify(ghsSymbols)]
    );
    
    // Get the newly created chemical
    const [chemicals] = await pool.execute(
      'SELECT * FROM chemicals WHERE id = ?',
      [result.insertId]
    );
    
    // Add to audit log
    await addAuditLog('chemical', 'add', name, req.user.id, {
      batchNumber, quantity: initialQuantity
    });
    
    res.status(201).json(chemicals[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating chemical', error: error.message });
  }
};

// Update chemical
const updateChemical = async (req, res) => {
  try {
    const {
      name, batchNumber, brand, volume, initialQuantity, currentQuantity,
      expirationDate, dateOfArrival, safetyClass, location, ghsSymbols
    } = req.body;
    
    await pool.execute(
      `UPDATE chemicals 
       SET name = ?, batch_number = ?, brand = ?, volume = ?, initial_quantity = ?, 
           current_quantity = ?, expiration_date = ?, date_of_arrival = ?, 
           safety_class = ?, location = ?, ghs_symbols = ?
       WHERE id = ?`,
      [name, batchNumber, brand, volume, initialQuantity, currentQuantity,
       expirationDate, dateOfArrival, safetyClass, location, 
       JSON.stringify(ghsSymbols), req.params.id]
    );
    
    // Get the updated chemical
    const [chemicals] = await pool.execute(
      'SELECT * FROM chemicals WHERE id = ?',
      [req.params.id]
    );
    
    // Add to audit log
    await addAuditLog('chemical', 'update', name, req.user.id, {
      batchNumber, quantity: currentQuantity
    });
    
    res.json(chemicals[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating chemical', error: error.message });
  }
};

// Delete chemical
const deleteChemical = async (req, res) => {
  try {
    // Get chemical info for audit log
    const [chemicals] = await pool.execute(
      'SELECT name, batch_number FROM chemicals WHERE id = ?',
      [req.params.id]
    );
    
    if (chemicals.length === 0) {
      return res.status(404).json({ message: 'Chemical not found' });
    }
    
    await pool.execute(
      'DELETE FROM chemicals WHERE id = ?',
      [req.params.id]
    );
    
    // Add to audit log
    await addAuditLog('chemical', 'delete', chemicals[0].name, req.user.id, {
      batchNumber: chemicals[0].batch_number
    });
    
    res.json({ message: 'Chemical deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting chemical', error: error.message });
  }
};

// Log chemical usage
const logChemicalUsage = async (req, res) => {
  try {
    const { chemicalId, date, location, quantity, notes, opened } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO chemical_usage_logs 
       (chemical_id, user_id, date, location, quantity, notes, opened)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [chemicalId, req.user.id, date, location, quantity, notes, opened || false]
    );
    
    // Update chemical quantity
    await pool.execute(
      'UPDATE chemicals SET current_quantity = current_quantity - ? WHERE id = ?',
      [quantity, chemicalId]
    );
    
    // Get chemical name for audit log
    const [chemicals] = await pool.execute(
      'SELECT name FROM chemicals WHERE id = ?',
      [chemicalId]
    );
    
    // Add to audit log
    await addAuditLog('chemical', 'usage', chemicals[0].name, req.user.id, {
      quantity, location, date
    });
    
    res.status(201).json({ message: 'Usage logged successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging usage', error: error.message });
  }
};

module.exports = {
  getAllChemicals,
  getChemicalById,
  createChemical,
  updateChemical,
  deleteChemical,
  logChemicalUsage
};