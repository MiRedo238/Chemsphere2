const pool = require('../config/database');

// Check for low stock chemicals
const checkLowStock = async () => {
  try {
    const [chemicals] = await pool.execute(`
      SELECT * FROM chemicals 
      WHERE current_quantity <= initial_quantity * 0.1
      AND id NOT IN (
        SELECT item_id FROM notifications 
        WHERE type = 'low_stock' AND is_read = FALSE
      )
    `);
    
    for (const chemical of chemicals) {
      await pool.execute(
        `INSERT INTO notifications 
         (type, title, message, item_type, item_id)
         VALUES (?, ?, ?, ?, ?)`,
        ['low_stock', 
         'Low Stock Alert', 
         `Chemical "${chemical.name}" (Batch: ${chemical.batch_number}) is running low. Current quantity: ${chemical.current_quantity}`,
         'chemical',
         chemical.id]
      );
    }
    
    console.log(`Generated ${chemicals.length} low stock notifications`);
  } catch (error) {
    console.error('Error checking low stock:', error);
  }
};

// Check for expiring chemicals
const checkExpiringChemicals = async () => {
  try {
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    
    const [chemicals] = await pool.execute(`
      SELECT * FROM chemicals 
      WHERE expiration_date <= ? 
      AND expiration_date > CURDATE()
      AND id NOT IN (
        SELECT item_id FROM notifications 
        WHERE type = 'expiration' AND is_read = FALSE
      )
    `, [threeMonthsFromNow]);
    
    for (const chemical of chemicals) {
      await pool.execute(
        `INSERT INTO notifications 
         (type, title, message, item_type, item_id)
         VALUES (?, ?, ?, ?, ?)`,
        ['expiration', 
         'Expiration Alert', 
         `Chemical "${chemical.name}" (Batch: ${chemical.batch_number}) will expire on ${chemical.expiration_date}`,
         'chemical',
         chemical.id]
      );
    }
    
    console.log(`Generated ${chemicals.length} expiration notifications`);
  } catch (error) {
    console.error('Error checking expiring chemicals:', error);
  }
};

// Check for equipment maintenance
const checkEquipmentMaintenance = async () => {
  try {
    const [equipment] = await pool.execute(`
      SELECT * FROM equipment 
      WHERE next_maintenance <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      AND next_maintenance > CURDATE()
      AND id NOT IN (
        SELECT item_id FROM notifications 
        WHERE type = 'maintenance' AND is_read = FALSE
      )
    `);
    
    for (const item of equipment) {
      await pool.execute(
        `INSERT INTO notifications 
         (type, title, message, item_type, item_id)
         VALUES (?, ?, ?, ?, ?)`,
        ['maintenance', 
         'Maintenance Alert', 
         `Equipment "${item.name}" (ID: ${item.serial_id}) requires maintenance by ${item.next_maintenance}`,
         'equipment',
         item.id]
      );
    }
    
    console.log(`Generated ${equipment.length} maintenance notifications`);
  } catch (error) {
    console.error('Error checking equipment maintenance:', error);
  }
};

module.exports = {
  checkLowStock,
  checkExpiringChemicals,
  checkEquipmentMaintenance
};