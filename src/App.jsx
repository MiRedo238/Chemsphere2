// src/App.jsx
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChemicalsList from './components/ChemicalsList';
import EquipmentList from './components/EquipmentList';
import AddChemical from './components/AddChemical';
import AddEquipment from './components/AddEquipment';
import DetailView from './components/DetailView';
import Login from './components/Login';
import AuditLogs from './components/AuditLogs';
import LogChemicalUsage from './components/LogChemicalUsage';
import { useAuth } from './contexts/AuthContext';
import { getChemicals, getEquipment, getAuditLogs, getChemicalUsageLogs, getEquipmentMaintenanceLogs } from './services/api';
import './styles/global.css';
import './styles/components.css';

const App = () => {
  const [currentView, setCurrentView] = useState('login');
  const [chemicals, setChemicals] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [chemicalUsageLogs, setChemicalUsageLogs] = useState([]);
  const [equipmentMaintenanceLogs, setEquipmentMaintenanceLogs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    if (user) {
      setCurrentView('dashboard');
      fetchData();
    } else {
      setCurrentView('login');
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [
        chemicalsData, 
        equipmentData, 
        auditLogsData,
        chemicalUsageData,
        equipmentMaintenanceData
      ] = await Promise.all([
        getChemicals(),
        getEquipment(),
        getAuditLogs(),
        getChemicalUsageLogs(),
        getEquipmentMaintenanceLogs()
      ]);
      
      setChemicals(chemicalsData);
      setEquipment(equipmentData);
      setAuditLogs(auditLogsData);
      setChemicalUsageLogs(chemicalUsageData);
      setEquipmentMaintenanceLogs(equipmentMaintenanceData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try refreshing the page.');
      
      // If unauthorized, log out
      if (error.message.includes('401') || error.message.includes('403')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const updateChemicals = (updatedChemicals) => {
    setChemicals(updatedChemicals);
  };

  const updateEquipment = (updatedEquipment) => {
    setEquipment(updatedEquipment);
  };

  const addNewAuditLog = (log) => {
    setAuditLogs(prevLogs => [log, ...prevLogs]);
  };

  const updateChemicalUsageLogs = (updatedLogs) => {
    setChemicalUsageLogs(updatedLogs);
  };

  const updateEquipmentMaintenanceLogs = (updatedLogs) => {
    setEquipmentMaintenanceLogs(updatedLogs);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentView('login');
      // Clear all local state
      setChemicals([]);
      setEquipment([]);
      setAuditLogs([]);
      setChemicalUsageLogs([]);
      setEquipmentMaintenanceLogs([]);
      setSelectedItem(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading application data...</p>
        </div>
      );
    }

    if (error && currentView !== 'login') {
      return (
        <div className="error-container">
          <div className="error-message">
            {error}
            <button 
              onClick={fetchData}
              className="retry-button"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'login':
        return <Login />;
      case 'dashboard':
        return (
          <Dashboard 
            chemicals={chemicals} 
            equipment={equipment} 
            setCurrentView={setCurrentView}
            userRole={user?.role}
            updateChemicals={updateChemicals}
            updateEquipment={updateEquipment}
            addAuditLog={addNewAuditLog}
            refreshData={fetchData}
          />
        );
      case 'chemicals':
        return (
          <ChemicalsList 
            chemicals={chemicals} 
            setSelectedItem={setSelectedItem}
            setCurrentView={setCurrentView}
            userRole={user?.role}
            updateChemicals={updateChemicals}
            addAuditLog={addNewAuditLog}
            refreshData={fetchData}
          />
        );
      case 'equipment':
        return (
          <EquipmentList 
            equipment={equipment} 
            setSelectedItem={setSelectedItem}
            setCurrentView={setCurrentView}
            userRole={user?.role}
            updateEquipment={updateEquipment}
            addAuditLog={addNewAuditLog}
            refreshData={fetchData}
          />
        );
      case 'detail':
        return (
          <DetailView 
            selectedItem={selectedItem}
            setCurrentView={setCurrentView}
            userRole={user?.role}
            chemicals={chemicals}
            equipment={equipment}
            updateChemicals={updateChemicals}
            updateEquipment={updateEquipment}
            addAuditLog={addNewAuditLog}
            refreshData={fetchData}
          />
        );
      case 'audit-logs':
        return (
          <AuditLogs 
            auditLogs={auditLogs}
            setCurrentView={setCurrentView}
            userRole={user?.role}
          />
        );
      case 'log-usage':
        return (
          <LogChemicalUsage 
            chemicals={chemicals}
            equipment={equipment}
            setCurrentView={setCurrentView}
            updateChemicals={updateChemicals}
            updateEquipment={updateEquipment}
            addAuditLog={addNewAuditLog}
            userRole={user?.role}
            currentUser={user}
            refreshData={fetchData}
            usageLogs={chemicalUsageLogs}
            updateUsageLogs={updateChemicalUsageLogs}
          />
        );
      default:
        return (
          <Dashboard 
            chemicals={chemicals} 
            equipment={equipment} 
            setCurrentView={setCurrentView}
            userRole={user?.role}
            updateChemicals={updateChemicals}
            updateEquipment={updateEquipment}
            addAuditLog={addNewAuditLog}
            refreshData={fetchData}
          />
        );
    }
  };

  if (currentView === 'login' || authLoading) {
    return <Login />;
  }

  return (
    <div className="app">
      <Header 
        currentUser={user} 
        setCurrentView={setCurrentView} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />
      <div className="main-container">
        <Sidebar 
          currentView={currentView} 
          setCurrentView={(view) => {
            setCurrentView(view);
            setSidebarOpen(false);
          }} 
          userRole={user?.role} 
          className={sidebarOpen ? "sidebar open" : "sidebar"} 
        />
        <div className="content">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};

export default App;