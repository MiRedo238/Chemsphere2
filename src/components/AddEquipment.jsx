// src/components/AddEquipment.jsx (updated for modal compatibility)
import React, { useState } from 'react';
import { ChevronLeft, Microscope } from 'lucide-react';
import Autocomplete from './Autocomplete';
import { createEquipment } from '../services/api';

const AddEquipment = ({ setCurrentView, equipment, updateEquipment, addAuditLog, userRole, isModal, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    serial_number: '',
    status: 'Available',
    location: '',
    purchase_date: '',
    warranty_expiration: '',
    condition: 'Good',
    assigned_user: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get unique data for autocomplete
  const equipmentNames = [...new Set(equipment.map(e => e.name))].map(name => ({ name }));
  const equipmentModels = [...new Set(equipment.map(e => e.model))].map(model => ({ model }));
  const equipmentLocations = [...new Set(equipment.map(e => e.location))].map(location => ({ location }));
  const equipmentUsers = [...new Set(equipment.map(e => e.assigned_user).filter(Boolean))].map(user => ({ assigned_user: user }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newEquipment = await createEquipment(formData);
      
      // Update local state if updateEquipment function is provided
      if (updateEquipment) {
        updateEquipment(newEquipment);
      }
      
      // Add audit log if function is provided
      if (addAuditLog) {
        addAuditLog({
          action: 'CREATE_EQUIPMENT',
          details: `Added equipment: ${formData.name} (Model: ${formData.model})`,
          equipment_id: newEquipment.id
        });
      }
      
      // Reset form
      setFormData({
        name: '',
        model: '',
        serial_number: '',
        status: 'Available',
        location: '',
        purchase_date: '',
        warranty_expiration: '',
        condition: 'Good',
        assigned_user: ''
      });
      
      // Close modal or redirect
      if (isModal && onClose) {
        onClose();
      } else if (!isModal) {
        setCurrentView('equipment');
      }
      
    } catch (error) {
      console.error('Failed to add equipment:', error);
      setError(error.message || 'Failed to add equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutocompleteSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {!isModal && (
        <div className="detail-header">
          <button 
            onClick={() => setCurrentView('equipment')}
            className="back-button"
          >
            <ChevronLeft className="back-icon" />
          </button>
          <h1 className="detail-title">
            <Microscope className="inline mr-2" />
            Add Equipment
          </h1>
        </div>
      )}

      <div className="form-container">
        {error && (
          <div className="error-message mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Equipment Name</label>
            <Autocomplete
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              suggestions={equipmentNames}
              placeholder="Enter equipment name"
              onSelect={(item) => handleAutocompleteSelect('name', item.name)}
              field="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Model Number</label>
            <Autocomplete
              value={formData.model}
              onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
              suggestions={equipmentModels}
              placeholder="Enter model number"
              onSelect={(item) => handleAutocompleteSelect('model', item.model)}
              field="model"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Serial Number</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.serial_number}
              onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Available">Available</option>
                <option value="Broken">Broken</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select
                className="form-select"
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
              >
                <option value="Good">Good</option>
                <option value="Needs Repair">Needs Repair</option>
                <option value="Broken">Broken</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <Autocomplete
              value={formData.location}
              onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              suggestions={equipmentLocations}
              placeholder="Enter location"
              onSelect={(item) => handleAutocompleteSelect('location', item.location)}
              field="location"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Purchase Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.purchase_date}
                onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Warranty Expiration</label>
              <input
                type="date"
                className="form-input"
                value={formData.warranty_expiration}
                onChange={(e) => setFormData({...formData, warranty_expiration: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned User (Optional)</label>
            <Autocomplete
              value={formData.assigned_user}
              onChange={(value) => setFormData(prev => ({ ...prev, assigned_user: value }))}
              suggestions={equipmentUsers}
              placeholder="Enter user name"
              onSelect={(item) => handleAutocompleteSelect('assigned_user', item.assigned_user)}
              field="assigned_user"
            />
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="form-button"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEquipment;