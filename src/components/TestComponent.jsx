// src/components/TestComponent.jsx
import React from 'react';

const TestComponent = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1>Test Component</h1>
      <p>If you can see this, React is working!</p>
      <div className="stat-card">
        <div className="stat-card-content">
          <div>
            <p className="stat-card-label">Test Label</p>
            <p className="stat-card-value">Test Value</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;