// src/utils/helpers.js
// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Calculate days until expiration
export const daysUntilExpiration = (expirationDate) => {
  if (!expirationDate) return Infinity;
  const expDate = new Date(expirationDate);
  const today = new Date();
  const diffTime = expDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Filter chemicals by search term (FIXED for backend compatibility)
export const filterChemicals = (chemicals, searchTerm, filterClass) => {
  return chemicals.filter(chem => {
    // Handle undefined or null values safely
    const name = chem.name || '';
    const batchNumber = chem.batch_number || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterClass === 'all' || chem.safety_class === filterClass;
    return matchesSearch && matchesFilter;
  });
};

// Filter equipment by search term (FIXED for backend compatibility)
export const filterEquipment = (equipment, searchTerm, statusFilter) => {
  return equipment.filter(eq => {
    // Handle undefined or null values safely
    const name = eq.name || '';
    const serialId = eq.serial_id || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         serialId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
};

// Sort items by field (updated for backend field names)
export const sortItems = (items, field, direction = 'asc') => {
  return [...items].sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];
    
    // Handle undefined or null values
    if (valueA === null || valueA === undefined) valueA = '';
    if (valueB === null || valueB === undefined) valueB = '';
    
    if (typeof valueA === 'string') valueA = valueA.toLowerCase();
    if (typeof valueB === 'string') valueB = valueB.toLowerCase();
    
    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Export data to CSV (updated for backend field names)
export const exportToCSV = (data, filename) => {
  if (data.length === 0) return;
  
  // Map backend field names to frontend expected names
  const mappedData = data.map(item => {
    if ('batch_number' in item) {
      // Chemical data
      return {
        name: item.name,
        batchNumber: item.batch_number,
        brand: item.brand,
        volume: item.volume,
        initialQuantity: item.initial_quantity,
        currentQuantity: item.current_quantity,
        expirationDate: item.expiration_date,
        dateOfArrival: item.date_of_arrival,
        safetyClass: item.safety_class,
        location: item.location,
        ghsSymbols: item.ghs_symbols ? item.ghs_symbols.join(',') : ''
      };
    } else {
      // Equipment data
      return {
        name: item.name,
        model: item.model,
        serialId: item.serial_id,
        status: item.status,
        location: item.location,
        purchaseDate: item.purchase_date,
        warrantyExpiration: item.warranty_expiration,
        condition: item.condition,
        lastMaintenance: item.last_maintenance,
        nextMaintenance: item.next_maintenance
      };
    }
  });
  
  const headers = Object.keys(mappedData[0]).join(',');
  const rows = mappedData.map(obj => Object.values(obj).join(','));
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

// Import from CSV (for local file parsing - used when API import is not available)
export const importFromCSV = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index] ? values[index].trim() : '';
      });
      return obj;
    }).filter(obj => Object.values(obj).some(val => val !== ''));
    
    callback(data);
  };
  reader.readAsText(file);
};