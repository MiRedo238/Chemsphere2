// src/services/api.js

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create axios instance
const api = axios.create({
  baseURL: API_URL + "/api",
});

// ✅ Attach JWT token from localStorage for every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Request failed');
  }
  return response.json();
};

// Chemicals API
export const getChemicals = async () => {
  const response = await fetch(`${API_BASE}/chemicals`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getChemical = async (id) => {
  const response = await fetch(`${API_BASE}/chemicals/${id}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const createChemical = async (chemicalData) => {
  const response = await fetch(`${API_BASE}/chemicals`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(chemicalData)
  });
  return handleResponse(response);
};

export const updateChemical = async (id, chemicalData) => {
  const response = await fetch(`${API_BASE}/chemicals/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(chemicalData)
  });
  return handleResponse(response);
};

export const deleteChemical = async (id) => {
  const response = await fetch(`${API_BASE}/chemicals/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const importChemicals = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/chemicals/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  return handleResponse(response);
};

// Equipment API
export const getEquipment = async () => {
  const response = await fetch(`${API_BASE}/equipment`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getEquipmentItem = async (id) => {
  const response = await fetch(`${API_BASE}/equipment/${id}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const createEquipment = async (equipmentData) => {
  const response = await fetch(`${API_BASE}/equipment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(equipmentData)
  });
  return handleResponse(response);
};

export const updateEquipment = async (id, equipmentData) => {
  const response = await fetch(`${API_BASE}/equipment/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(equipmentData)
  });
  return handleResponse(response);
};

export const deleteEquipment = async (id) => {
  const response = await fetch(`${API_BASE}/equipment/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Add the missing importEquipment function
export const importEquipment = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/equipment/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  return handleResponse(response);
};

// Audit Logs API
export const getAuditLogs = async () => {
  const response = await fetch(`${API_BASE}/audit`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Chemical usage logs
export const logChemicalUsage = async (usageData) => {
  const response = await fetch(`${API_BASE}/chemicals/usage`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(usageData)
  });
  return handleResponse(response);
};

export const getChemicalUsageLogs = async (userId = null) => {
  const url = userId ? `${API_BASE}/chemicals/usage?userId=${userId}` : `${API_BASE}/chemicals/usage`;
  const response = await fetch(url, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const updateChemicalUsageLog = async (id, logData) => {
  const response = await fetch(`${API_BASE}/chemicals/usage/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(logData)
  });
  return handleResponse(response);
};

export const deleteChemicalUsageLog = async (id) => {
  const response = await fetch(`${API_BASE}/chemicals/usage/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Equipment maintenance logs
export const logEquipmentUsage = async (usageData) => {
  const response = await fetch(`${API_BASE}/equipment/usage`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(usageData)
  });
  return handleResponse(response);
};

export const getEquipmentMaintenanceLogs = async (userId = null) => {
  const url = userId ? `${API_BASE}/equipment/usage?userId=${userId}` : `${API_BASE}/equipment/usage`;
  const response = await fetch(url, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const updateEquipmentMaintenanceLog = async (id, logData) => {
  const response = await fetch(`${API_BASE}/equipment/usage/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(logData)
  });
  return handleResponse(response);
};

export const deleteEquipmentMaintenanceLog = async (id) => {
  const response = await fetch(`${API_BASE}/equipment/usage/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// Notifications API
export const getNotifications = async () => {
  const response = await fetch(`${API_BASE}/notifications`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const markNotificationAsRead = async (id) => {
  const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export default api;