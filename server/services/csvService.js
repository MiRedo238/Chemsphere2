const csv = require('csv-writer').createObjectCsvWriter;
const csvParser = require('csv-parser');
const stream = require('stream');
const pool = require('../config/database');

// Export chemicals to CSV
const exportChemicalsToCSV = async () => {
  try {
    const [chemicals] = await pool.execute(`
      SELECT name, batch_number, brand, volume, initial_quantity, 
             current_quantity, expiration_date, date_of_arrival, 
             safety_class, location
      FROM chemicals
      ORDER BY name
    `);
    
    const csvWriter = csv({
      path: 'temp/chemicals_export.csv',
      header: [
        { id: 'name', title: 'Name' },
        { id: 'batch_number', title: 'Batch Number' },
        { id: 'brand', title: 'Brand' },
        { id: 'volume', title: 'Volume' },
        { id: 'initial_quantity', title: 'Initial Quantity' },
        { id: 'current_quantity', title: 'Current Quantity' },
        { id: 'expiration_date', title: 'Expiration Date' },
        { id: 'date_of_arrival', title: 'Date of Arrival' },
        { id: 'safety_class', title: 'Safety Class' },
        { id: 'location', title: 'Location' }
      ]
    });
    
    await csvWriter.writeRecords(chemicals);
    return 'temp/chemicals_export.csv';
  } catch (error) {
    throw new Error(`CSV export failed: ${error.message}`);
  }
};

// Import chemicals from CSV
const importChemicalsFromCSV = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    
    bufferStream
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          for (const item of results) {
            await pool.execute(
              `INSERT INTO chemicals 
               (name, batch_number, brand, volume, initial_quantity, current_quantity,
                expiration_date, date_of_arrival, safety_class, location)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE
               brand = VALUES(brand), volume = VALUES(volume), 
               initial_quantity = VALUES(initial_quantity), 
               current_quantity = VALUES(current_quantity),
               expiration_date = VALUES(expiration_date), 
               date_of_arrival = VALUES(date_of_arrival),
               safety_class = VALUES(safety_class), location = VALUES(location)`,
              [
                item.Name, item['Batch Number'], item.Brand, item.Volume,
                parseInt(item['Initial Quantity']), parseInt(item['Current Quantity']),
                item['Expiration Date'], item['Date of Arrival'],
                item['Safety Class'], item.Location
              ]
            );
          }
          resolve({ imported: results.length });
        } catch (error) {
          reject(new Error(`CSV import failed: ${error.message}`));
        }
      })
      .on('error', (error) => reject(error));
  });
};

module.exports = {
  exportChemicalsToCSV,
  importChemicalsFromCSV
};