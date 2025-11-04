const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/auth';

export const apiConfig = {
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const endpoints = {
  auth: {
    register: `${API_URL}/auth/register`,
    login: `${API_URL}/auth/login`,
    profile: `${API_URL}/auth/profile`,
    updateProfile: `${API_URL}/auth/profile`,
    changePassword: `${API_URL}/auth/change-password`,
  },
  patients: {
    create: `${API_URL}/patients`,
    getAll: `${API_URL}/patients`,
    getByIdentification: (id: string) => `${API_URL}/patients/identification/${id}`,
    update: (id: string) => `${API_URL}/patients/${id}`,
    delete: (id: string) => `${API_URL}/patients/${id}`,
  },
  triage: {
    create: `${API_URL}/triage`,
    getAll: `${API_URL}/triage`,
    getById: (id: string) => `${API_URL}/triage/${id}`,
    updateStatus: (id: string) => `${API_URL}/triage/${id}/status`,
    getStats: `${API_URL}/triage/stats`,
  },
};

export default API_URL;
