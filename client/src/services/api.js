import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('visionguard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getDemoUsers: () => api.get('/auth/demo-users'),
};

// Inspections endpoints
export const inspectionsApi = {
  getInspections: (params) => api.get('/inspections', { params }),
  getInspectionById: (id) => api.get(`/inspections/${id}`),
  createInspection: (formDataOrData) => {
    const isFormData = formDataOrData instanceof FormData;
    return api.post('/inspections', formDataOrData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
  },
  deleteInspection: (id) => api.delete(`/inspections/${id}`)
};

// Issues endpoints
export const issuesApi = {
  getIssues: (params) => api.get('/issues', { params }),
  updateStatus: (id, status) => api.patch(`/issues/${id}/status`, { status })
};

// Analytics endpoints
export const analyticsApi = {
  getSummary: () => api.get('/analytics/summary'),
  getLabs: () => api.get('/analytics/labs'),
};

// Workstations endpoints
export const workstationsApi = {
  getWorkstations: () => api.get('/workstations'),
  getWorkstationHistory: (id) => api.get(`/workstations/${id}/history`)
};

// System Health
export const systemApi = {
  getHealth: () => api.get('/health')
};

export default api;
