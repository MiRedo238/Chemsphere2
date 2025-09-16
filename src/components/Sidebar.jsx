// src/components/Sidebar.jsx
import React from 'react';
import {
  Home,
  Microscope,
  FlaskConical,
  FileText,
  Activity,
  MapPin,
} from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView, userRole, className }) => {
  const isAdmin = userRole === 'admin';
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'chemicals', label: 'Chemicals', icon: FlaskConical },
    { id: 'equipment', label: 'Equipment', icon: Microscope },
    { id: 'log-usage', label: 'Log Chemical Usage', icon: Activity },
    /*{ id: 'chemical-outs', label: 'Chemical Outs', icon: MapPin },*/
    ...(isAdmin ? [
      { id: 'audit-logs', label: 'Audit Logs', icon: FileText }
    ] : [])
  ];

  return (
    <aside className={className || "sidebar"}>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`sidebar-button ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)} // this will also close sidebar in App.jsx
            >
              <Icon className="sidebar-icon" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
