// src/components/ChemicalUsage.jsx (updated)
import React, { useState } from 'react';
import { ChevronLeft, FlaskConical, User, MapPin } from 'lucide-react';
import Autocomplete from './Autocomplete';
import { addAuditLog } from '../utils/helpers';

const ChemicalUsage = ({ chemicals, setCurrentView, updateChemicals, addAuditLog, userRole }) => {
  const [selectedChemical, setSelectedChemical] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [user, setUser] = useState('');
  const [location, setLocation] = useState('');
  const [opened, setOpened] = useState(false);

  // Get unique users and locations for autocomplete
  const chemicalUsers = [...new Set(chemicals.flatMap(c => c.usageLog.map(u => u.user)))].map(user => ({ user }));
  const chemicalLocations = [...new Set(chemicals.flatMap(c => [c.location, ...c.usageLog.map(u => u.location)]))].map(location => ({ location }));

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedChemical || !quantity || !user) return;

    const updatedChemicals = chemicals.map(chem => {
      if (chem.id === selectedChemical.id) {
        const newQuantity = Math.max(0, chem.currentQuantity - parseInt(quantity));
        const newLocation = newQuantity > 0 ? location : chem.location;
        
        const usageLog = [
          ...chem.usageLog,
          {
            date: new Date().toISOString().split('T')[0],
            user,
            location: location || chem.location,
            quantity: parseInt(quantity),
            opened
          }
        ];

        return {
          ...chem,
          currentQuantity: newQuantity,
          location: newLocation,
          usageLog
        };
      }
      return chem;
    });

    updateChemicals(updatedChemicals);
    
    // Add to audit log
    addAuditLog('chemical', 'usage', selectedChemical.name, userRole, {
      quantity: parseInt(quantity),
      location: location || selectedChemical.location,
      user
    });

    // Reset form
    setSelectedChemical(null);
    setQuantity('');
    setUser('');
    setLocation('');
    setOpened(false);
  };

  return (
    <div>
      <div className="detail-header">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="back-button"
        >
          <ChevronLeft className="back-icon" />
        </button>
        <h1 className="detail-title">
          <FlaskConical className="inline mr-2" />
          Update Chemical Usage
        </h1>
      </div>

      <div className="usage-form">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Select Chemical</label>
            <select
              className="form-select"
              value={selectedChemical?.id || ''}
              onChange={(e) => {
                const chem = chemicals.find(c => c.id === parseInt(e.target.value));
                setSelectedChemical(chem);
                setLocation(chem?.location || '');
              }}
              required
            >
              <option value="">Select a chemical</option>
              {chemicals.map(chem => (
                <option key={chem.id} value={chem.id}>
                  {chem.name} - {chem.batchNumber} ({chem.currentQuantity} remaining)
                </option>
              ))}
            </select>
          </div>

          {selectedChemical && (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Quantity Used</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedChemical.currentQuantity}
                    className="form-input"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Max: {selectedChemical.currentQuantity} units available
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">User</label>
                  <Autocomplete
                    value={user}
                    onChange={setUser}
                    suggestions={chemicalUsers}
                    placeholder="Enter user name"
                    onSelect={(item) => setUser(item.user)}
                    field="user"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <MapPin className="inline mr-1" size={16} />
                  Location
                </label>
                <Autocomplete
                  value={location}
                  onChange={setLocation}
                  suggestions={chemicalLocations}
                  placeholder={selectedChemical.location}
                  onSelect={(item) => setLocation(item.location)}
                  field="location"
                />
              </div>

              <div className="form-group">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={opened}
                    onChange={(e) => setOpened(e.target.checked)}
                    className="mr-2"
                  />
                  <span>Mark as opened</span>
                </label>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="form-button"
                  disabled={!quantity || !user}
                >
                  Record Usage
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChemicalUsage;