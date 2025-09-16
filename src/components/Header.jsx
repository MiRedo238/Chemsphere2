// src/components/Header.jsx
import React from 'react';
import { LogOut, User, Menu } from 'lucide-react';

const Header = ({ currentUser, onLogout, setCurrentView, toggleSidebar }) => {
  return (
    <header className="header">
      {/* Hamburger (mobile only) */}
      <button 
        className="hamburger md:hidden" 
        onClick={toggleSidebar}
      >
        <Menu className="hamburger-icon" />
      </button>

      <h1 className="header-title" onClick={() => setCurrentView('dashboard')}>
        UIC ChemSphere
      </h1>

      <div className="header-user">
        <User size={16} />
        <span>{currentUser?.name} ({currentUser?.role})</span>
        <button onClick={onLogout} className="flex items-center ml-4">
          <LogOut size={16} className="mr-1" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
