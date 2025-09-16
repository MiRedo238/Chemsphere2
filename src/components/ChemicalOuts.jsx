// src/components/ChemicalOuts.jsx
import React, { useState } from 'react';
import { ChevronLeft, MapPin, User, Clock } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const ChemicalOuts = ({ chemicals, setCurrentView, userRole }) => {
  const [filterLocation, setFilterLocation] = useState('');

  // Find chemicals that are not in their primary location
  // For this example, we'll assume primary locations start with "Lab"
  const outChemicals = chemicals.filter(chem => {
    const inPrimaryLocation = chem.location.startsWith('Lab');
    const hasUsage = chem.usageLog.length > 0;
    const matchesFilter = filterLocation ? chem.location.includes(filterLocation) : true;
    
    return !inPrimaryLocation && hasUsage && matchesFilter;
  });

  // Get unique locations for filter
  const uniqueLocations = [...new Set(outChemicals.map(chem => chem.location))];

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
          <MapPin className="inline mr-2" />
          Chemical Out Locations
        </h1>
      </div>

      <div className="outs-container">
        <div className="mb-4">
          <label className="form-label">Filter by Location</label>
          <select
            className="form-select"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {outChemicals.length > 0 ? (
          <div className="space-y-4">
            {outChemicals.map(chem => {
              const lastUsage = chem.usageLog[chem.usageLog.length - 1];
              
              return (
                <div key={chem.id} className="list-item">
                  <div className={`safety-indicator ${safetyColors[chem.safetyClass]}`}></div>
                  <div className="item-details flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="item-name">{chem.name}</h3>
                        <p className="item-meta">{chem.batchNumber} • {chem.brand}</p>
                        <p className="item-meta flex items-center">
                          <MapPin size={14} className="mr-1" />
                          Current: {chem.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="item-meta">
                          Qty: {chem.currentQuantity}/{chem.initialQuantity}
                        </p>
                        <p className="item-meta flex items-center">
                          <User size={14} className="mr-1" />
                          {lastUsage.user}
                        </p>
                        <p className="item-meta flex items-center">
                          <Clock size={14} className="mr-1" />
                          {formatDate(lastUsage.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-data">No chemicals found outside primary storage</p>
        )}
      </div>
    </div>
  );
};

export default ChemicalOuts;