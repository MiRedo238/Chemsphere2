// src/components/UpdateEquipment.jsx (updated)
import React, { useState } from 'react';
import { ChevronLeft, Microscope, User, Wrench, Calendar } from 'lucide-react';
import Autocomplete from './Autocomplete';
import { addAuditLog } from '../utils/helpers';

const UpdateEquipment = ({ equipment, setCurrentView, updateEquipment, addAuditLog, userRole }) => {
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [action, setAction] = useState('checkout');
  const [user, setUser] = useState('');
  const [notes, setNotes] = useState('');

  // Get unique users for autocomplete
  const equipmentUsers = [...new Set(equipment.map(e => e.assignedUser).filter(Boolean))].map(user => ({ user }));

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedEquipment || !user) return;

    const updatedEquipment = equipment.map(eq => {
      if (eq.id === selectedEquipment.id) {
        let newStatus = eq.status;
        let newAssignedUser = eq.assignedUser;
        const maintenanceLog = [...eq.maintenanceLog];
        const today = new Date().toISOString().split('T')[0];

        if (action === 'checkout') {
          newStatus = 'In Use';
          newAssignedUser = user;
          addAuditLog('equipment', 'checkout', eq.name, userRole, { user });
        } else if (action === 'checkin') {
          newStatus = 'Available';
          newAssignedUser = null;
          addAuditLog('equipment', 'checkin', eq.name, userRole, { user });
        } else if (action === 'maintenance') {
          maintenanceLog.push({
            date: today,
            action: 'Maintenance',
            user,
            notes
          });
          addAuditLog('equipment', 'maintenance', eq.name, userRole, { user, notes });
        } else if (action === 'repair') {
          newStatus = 'Under Maintenance';
          maintenanceLog.push({
            date: today,
            action: 'Repair',
            user,
            notes
          });
          addAuditLog('equipment', 'repair', eq.name, userRole, { user, notes });
        }

        return {
          ...eq,
          status: newStatus,
          assignedUser: newAssignedUser,
          maintenanceLog
        };
      }
      return eq;
    });

    updateEquipment(updatedEquipment);
    
    // Reset form
    setSelectedEquipment(null);
    setAction('checkout');
    setUser('');
    setNotes('');
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
          <Microscope className="inline mr-2" />
          Update Equipment Status
        </h1>
      </div>

      <div className="usage-form">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Select Equipment</label>
            <select
              className="form-select"
              value={selectedEquipment?.id || ''}
              onChange={(e) => {
                const eq = equipment.find(item => item.id === parseInt(e.target.value));
                setSelectedEquipment(eq);
                setUser(eq?.assignedUser || '');
              }}
              required
            >
              <option value="">Select equipment</option>
              {equipment.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} - {eq.serialId} ({eq.status})
                </option>
              ))}
            </select>
          </div>

          {selectedEquipment && (
            <>
              <div className="form-group">
                <label className="form-label">Action</label>
                <select
                  className="form-select"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  required
                >
                  <option value="checkout">Check Out</option>
                  <option value="checkin">Check In</option>
                  <option value="maintenance">Record Maintenance</option>
                  <option value="repair">Report for Repair</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User className="inline mr-1" size={16} />
                  {action === 'checkin' ? 'Returning User' : 'User'}
                </label>
                <Autocomplete
                  value={user}
                  onChange={setUser}
                  suggestions={equipmentUsers}
                  placeholder="Enter user name"
                  onSelect={(item) => setUser(item.user)}
                  field="user"
                />
              </div>

              {(action === 'maintenance' || action === 'repair') && (
                <div className="form-group">
                  <label className="form-label">
                    <Wrench className="inline mr-1" size={16} />
                    Notes
                  </label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe the maintenance or repair needed..."
                  />
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Current Status</h3>
                <p>Status: {selectedEquipment.status}</p>
                {selectedEquipment.assignedUser && (
                  <p>Assigned to: {selectedEquipment.assignedUser}</p>
                )}
                <p className="flex items-center">
                  <Calendar className="mr-1" size={14} />
                  Next maintenance: {selectedEquipment.nextMaintenance}
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="form-button"
                  disabled={!user}
                >
                  {action === 'checkout' ? 'Check Out' : 
                   action === 'checkin' ? 'Check In' : 
                   action === 'maintenance' ? 'Record Maintenance' : 'Report for Repair'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default UpdateEquipment;