// src/components/DetailView.jsx
import React, { useState } from 'react';
import { ChevronLeft, Edit, Trash2, User, MapPin, Clock, Microscope } from 'lucide-react';
import { safetyColors, statusColors, ghsSymbols } from '../utils/data';
import { formatDate } from '../utils/helpers';
import { updateChemical, deleteChemical, updateEquipment, deleteEquipment } from '../services/api';

const DetailView = ({ 
  selectedItem, 
  setCurrentView, 
  userRole, 
  chemicals, 
  equipment, 
  updateChemicals, 
  updateEquipment,
  addAuditLog,
  refreshData
}) => {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(selectedItem);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const isAdmin = userRole === 'admin';
  
  if (!selectedItem) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (selectedItem.type === 'chemical') {
        const updatedChemical = await updateChemical(selectedItem.id, editForm);
        updateChemicals(chemicals.map(chem => 
          chem.id === selectedItem.id ? updatedChemical : chem
        ));
        addAuditLog({
          type: 'chemical',
          action: 'update',
          itemName: updatedChemical.name,
          user: userRole,
          timestamp: new Date().toISOString(),
          details: { batchNumber: updatedChemical.batch_number }
        });
      } else {
        const updatedEquipment = await updateEquipment(selectedItem.id, editForm);
        updateEquipment(equipment.map(eq => 
          eq.id === selectedItem.id ? updatedEquipment : eq
        ));
        addAuditLog({
          type: 'equipment',
          action: 'update',
          itemName: updatedEquipment.name,
          user: userRole,
          timestamp: new Date().toISOString(),
          details: { serialId: updatedEquipment.serial_id }
        });
      }
      
      setEditing(false);
      setSelectedItem(editForm);
    } catch (error) {
      console.error('Failed to update:', error);
      setError('Failed to update item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this ${selectedItem.type}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      if (selectedItem.type === 'chemical') {
        await deleteChemical(selectedItem.id);
        updateChemicals(chemicals.filter(chem => chem.id !== selectedItem.id));
        addAuditLog({
          type: 'chemical',
          action: 'delete',
          itemName: selectedItem.name,
          user: userRole,
          timestamp: new Date().toISOString(),
          details: { batchNumber: selectedItem.batch_number }
        });
      } else {
        await deleteEquipment(selectedItem.id);
        updateEquipment(equipment.filter(eq => eq.id !== selectedItem.id));
        addAuditLog({
          type: 'equipment',
          action: 'delete',
          itemName: selectedItem.name,
          user: userRole,
          timestamp: new Date().toISOString(),
          details: { serialId: selectedItem.serial_id }
        });
      }
      
      setCurrentView(selectedItem.type === 'chemical' ? 'chemicals' : 'equipment');
    } catch (error) {
      console.error('Failed to delete:', error);
      setError('Failed to delete item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };

  if (selectedItem.type === 'chemical') {
    const chemical = editing ? editForm : selectedItem;
    
    return (
      <div>
        <div className="detail-header">
          <button 
            onClick={() => setCurrentView('chemicals')}
            className="back-button"
            disabled={loading}
          >
            <ChevronLeft className="back-icon" />
          </button>
          <h1 className="detail-title">Chemical Details</h1>
          {isAdmin && (
            <div className="ml-auto flex gap-2">
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)} className="form-button bg-gray-500" disabled={loading}>
                    Cancel
                  </button>
                  <button onClick={handleSave} className="form-button" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing(true)} className="view-button" disabled={loading}>
                    <Edit className="view-icon" />
                  </button>
                  <button onClick={handleDelete} className="view-button text-red-500" disabled={loading}>
                    <Trash2 className="view-icon" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="error-message mb-4">
            {error}
          </div>
        )}

        <div className="detail-container">
          <div className="detail-grid">
            <div>
              <h2 className="detail-section-title">{chemical.name}</h2>
              <div className="detail-properties">
                <div className="detail-property">
                  <span className="property-label">Batch Number:</span>
                  {editing ? (
                    <input
                      type="text"
                      name="batch_number"
                      value={chemical.batch_number}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <span className="property-value">{chemical.batch_number}</span>
                  )}
                </div>
                
                <div className="detail-property">
                  <span className="property-label">Brand:</span>
                  {editing ? (
                    <input
                      type="text"
                      name="brand"
                      value={chemical.brand}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <span className="property-value">{chemical.brand}</span>
                  )}
                </div>
                
                <div className="detail-property">
                  <span className="property-label">Volume:</span>
                  {editing ? (
                    <input
                      type="text"
                      name="volume"
                      value={chemical.volume}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <span className="property-value">{chemical.volume}</span>
                  )}
                </div>
                
                <div className="detail-property">
                  <span className="property-label">Initial Quantity:</span>
                  {editing ? (
                    <input
                      type="number"
                      name="initial_quantity"
                      value={chemical.initial_quantity}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <span className="property-value">{chemical.initial_quantity}</span>
                  )}
                </div>
                
                <div className="detail-property">
                  <span className="property-label">Current Quantity:</span>
                  {editing ? (
                    <input
                      type="number"
                      name="current_quantity"
                      value={chemical.current_quantity}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <span className="property-value">{chemical.current_quantity}</span>
                  )}
                </div>
                
                <div className="detail-property">
                  <span className="property-label">Expiration Date:</span>
                  {editing ? (
                    <input
                      type="date"
                      name="expiration_date"
                      value={chemical.expiration_date}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <span className="property-value">{formatDate(chemical.expiration_date)}</span>
                  )}
                </div>
                
                <div className="detail-property">
                  <span className="property-label">Date of Arrival:</span>
                  {editing ? (
                    <input
                      type="date"
                      name="date_of_arrival"
                      value={chemical.date_of_arrival}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <span className="property-value">{formatDate(chemical.date_of_arrival)}</span>
                  )}
                </div>
                
                <div className="detail-property">
                  <span className="property-label">Safety Class:</span>
                  {editing ? (
                    <select
                      name="safety_class"
                      value={chemical.safety_class}
                      onChange={handleInputChange}
                      className="form-select"
                      disabled={loading}
                    >
                      <option value="safe">Safe</option>
                      <option value="toxic">Toxic</option>
                      <option value="corrosive">Corrosive</option>
                      <option value="reactive">Reactive</option>
                      <option value="flammable">Flammable</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${safetyColors[chemical.safety_class]}`}>
                      {chemical.safety_class}
                    </span>
                  )}
                </div>
                
                <div className="detail-property">
                  <span className="property-label">Location:</span>
                  {editing ? (
                    <input
                      type="text"
                      name="location"
                      value={chemical.location}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <span className="property-value">{chemical.location}</span>
                  )}
                </div>
                
                {!editing && chemical.ghs_symbols && chemical.ghs_symbols.length > 0 && (
                  <div className="detail-property">
                    <span className="property-label">GHS Symbols:</span>
                    <div className="ghs-symbols">
                      {chemical.ghs_symbols && chemical.ghs_symbols.map(symbol => (
                        <img 
                          key={symbol} 
                          src={ghsSymbols[symbol]} 
                          alt={symbol}
                          title={symbol}
                          className="ghs-symbol-image"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="detail-section-title">Usage Log</h3>
              <div className="log-container">
                {chemical.usage_log && chemical.usage_log.map((log, index) => (
                  <div key={index} className="log-item">
                    <div className="log-header">
                      <div>
                        <p className="log-user">{log.user_name}</p>
                        <p className="log-location">
                          <MapPin size={12} className="inline mr-1" />
                          {log.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="log-quantity">{log.quantity} units</p>
                        <p className="log-date">
                          <Clock size={12} className="inline mr-1" />
                          {formatDate(log.date)}
                        </p>
                      </div>
                    </div>
                    {log.opened && <span className="log-tag">Opened</span>}
                  </div>
                ))}
                {(!chemical.usage_log || chemical.usage_log.length === 0) && (
                  <p className="no-data">No usage recorded</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    const equipmentItem = editing ? editForm : selectedItem;
    
    return (
      <div>
        <div className="detail-header">
          <button 
            onClick={() => setCurrentView('equipment')}
            className="back-button"
            disabled={loading}
          >
            <ChevronLeft className="back-icon" />
          </button>
          <h1 className="detail-title">Equipment Details</h1>
          {isAdmin && (
            <div className="ml-auto flex gap-2">
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)} className="form-button bg-gray-500" disabled={loading}>
                    Cancel
                  </button>
                  <button onClick={handleSave} className="form-button" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing(true)} className="view-button" disabled={loading}>
                    <Edit className="view-icon" />
                  </button>
                  <button onClick={handleDelete} className="view-button text-red-500" disabled={loading}>
                    <Trash2 className="view-icon" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="error-message mb-4">
            {error}
          </div>
        )}

        <div className="detail-container">
          <div className="detail-grid">
            <div>
              <h2 className="detail-section-title">{equipmentItem.name}</h2>
              <div className="detail-properties">
                <div className="detail-property">
                  <span className="property-label">Model Number:</span>
                  {editing ? (
                    <input
                      type="text"
                      name="model"
                      value={equipmentItem.model}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <span className="property-value">{equipmentItem.model}</span>
                  )}
                </div>
                
                <div className="detail-property">
                  <span className="property-label">Serial ID:</span>
                  {editing ? (
                    <input
                      type="text"
                      name="serial_id"
                      value={equipmentItem.serial_id}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <span className="property-value">{equipmentItem.serial_id}</span>
                  )}
                </div>
                
                <div className="detail-property">
                  <span className="property-label">Status:</span>
                  {editing ? (
                    <select
                      name="status"
                      value={equipmentItem.status}
                      onChange={handleInputChange}
                      className="form-select"
                      disabled={loading}
                    >
                      <option value="Available">Available</option>
                      <option value="Broken">Broken</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${statusColors[equipmentItem.status]}`}>
                      {equipmentItem.status}
                    </span>
                  )}
                </div>
                
                <div className="detail-property">
                  <span className="property-label">Location:</span>
                  {editing ? (
                    <input
                      type="text"
                      name="location"
                      value={equipmentItem.location}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <span className="property-value">{equipmentItem.location}</span>
                  )}
                </div>
                
                <div className="detail-property">
                  <span className="property-label">Purchase Date:</span>
                  {editing ? (
                    <input
                      type="date"
                      name="purchase_date"
                      value={equipmentItem.purchase_date}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <span className="property-value">{formatDate(equipmentItem.purchase_date)}</span>
                  )}
                </div>
                
                <div className="detail-property">
                  <span className="property-label">Warranty Expiration:</span>
                  {editing ? (
                    <input
                      type="date"
                      name="warranty_expiration"
                      value={equipmentItem.warranty_expiration}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={loading}
                    />
                  ) : (
                    <span className="property-value">{formatDate(equipmentItem.warranty_expiration)}</span>
                  )}
                </div>
                
                <div className="detail-property">
                  <span className="property-label">Condition:</span>
                  {editing ? (
                    <select
                      name="condition"
                      value={equipmentItem.condition}
                      onChange={handleInputChange}
                      className="form-select"
                      disabled={loading}
                    >
                      <option value="Good">Good</option>
                      <option value="Needs Repair">Needs Repair</option>
                      <option value="Broken">Broken</option>
                    </select>
                  ) : (
                    <span className="property-value">{equipmentItem.condition}</span>
                  )}
                </div>
                
                <div className="detail-property">
                  <span className="property-label">Last Maintenance:</span>
                  <span className="property-value">{formatDate(equipmentItem.last_maintenance)}</span>
                </div>
                
                <div className="detail-property">
                  <span className="property-label">Next Maintenance:</span>
                  <span className="property-value">{formatDate(equipmentItem.next_maintenance)}</span>
                </div>
                
              </div>
            </div>

            <div>
              <h3 className="detail-section-title">Maintenance Log</h3>
              <div className="log-container">
                {equipmentItem.maintenance_log && equipmentItem.maintenance_log.map((log, index) => (
                  <div key={index} className="log-item">
                    <div className="log-header">
                      <div>
                        <p className="log-user">{log.action}</p>
                        <p className="log-location">{log.user_name}</p>
                      </div>
                      <p className="log-date">{formatDate(log.date)}</p>
                    </div>
                    {log.notes && <p className="text-xs text-gray-500 mt-1">{log.notes}</p>}
                  </div>
                ))}
                {(!equipmentItem.maintenance_log || equipmentItem.maintenance_log.length === 0) && (
                  <p className="no-data">No maintenance recorded</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default DetailView;