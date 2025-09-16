const pool = require('../config/database');

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Calculate days until expiration
const daysUntilExpiration = (expirationDate) => {
  if (!expirationDate) return Infinity;
  const expDate = new Date(expirationDate);
  const today = new Date();
  const diffTime = expDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Add audit log
const addAuditLog = async (type, action, itemName, userId, details = {}) => {
  try {
    await pool.execute(
      `INSERT INTO audit_logs (type, action, item_name, user_id, details)
       VALUES (?, ?, ?, ?, ?)`,
      [type, action, itemName, userId, JSON.stringify(details)]
    );
  } catch (error) {
    console.error('Error adding audit log:', error);
  }
};

// Export data to CSV
const exportToCSV = (data, filename) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).join(','));
  const csv = [headers, ...rows].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Import data from CSV
const importFromCSV = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, i) => {
        obj[header.trim()] = values[i] ? values[i].trim() : '';
      });
      return obj;
    });
    
    callback(data);
  };
  reader.readAsText(file);
};

module.exports = {
  formatDate,
  daysUntilExpiration,
  addAuditLog,
  exportToCSV,
  importFromCSV
};