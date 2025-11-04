import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export const patientService = {
  create: (data: any) => apiClient.post('/patients', data),
  getAll: (params?: any) => apiClient.get('/patients', { params }),
  getByIdentification: (id: string) => apiClient.get(`/patients/identification/${id}`),
  update: (id: string, data: any) => apiClient.put(`/patients/${id}`, data),
  delete: (id: string) => apiClient.delete(`/patients/${id}`),
};

export const triageService = {
  create: (data: any) => apiClient.post('/triage', data),
  getAll: (params?: any) => apiClient.get('/triage', { params }),
  getById: (id: string) => apiClient.get(`/triage/${id}`),
  updateStatus: (id: string, data: any) => apiClient.put(`/triage/${id}/status`, data),
  getStats: () => apiClient.get('/triage/stats'),
};

export const authService = {
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (data: any) => apiClient.post('/auth/login', data),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data: any) => apiClient.put('/auth/profile', data),
  changePassword: (data: any) => apiClient.put('/auth/change-password', data),
};

export default apiClient;
