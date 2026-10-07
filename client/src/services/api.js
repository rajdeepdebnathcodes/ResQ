import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('resq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, purge token from storage
      const currentToken = localStorage.getItem('resq_token');
      if (currentToken) {
        localStorage.removeItem('resq_token');
        localStorage.removeItem('resq_user');
        // If not already on login page, redirect
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?session_expired=1';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

export const reportService = {
  createReport: (formData) => api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAllReports: (params) => api.get('/reports', { params }),
  getMyReports: () => api.get('/reports/my-reports'),
  getReportById: (id) => api.get(`/reports/${id}`),
  updateReportStatus: (id, data) => api.patch(`/reports/${id}/status`, data),
  deleteReport: (id) => api.delete(`/reports/${id}`)
};

export const rescueService = {
  createRescueRequest: (data) => api.post('/rescue', data),
  getPendingRequests: () => api.get('/rescue/pending'),
  getAllRescueRequests: (params) => api.get('/rescue', { params }),
  getMyAssignedRequests: () => api.get('/rescue/my-assignments'),
  getRescueDetails: (id) => api.get(`/rescue/${id}`),
  acceptRescueRequest: (id) => api.post(`/rescue/${id}/accept`),
  updateRescueStatus: (id, data) => api.post(`/rescue/${id}/update-status`, data)
};

export const shelterService = {
  getAllShelters: (params) => api.get('/shelters', { params }),
  getShelterById: (id) => api.get(`/shelters/${id}`),
  createShelter: (data) => api.post('/shelters', data),
  updateShelter: (id, data) => api.put(`/shelters/${id}`, data),
  deleteShelter: (id) => api.delete(`/shelters/${id}`)
};

export const alertService = {
  getActiveAlerts: () => api.get('/alerts/active'),
  getAllAlerts: () => api.get('/alerts'),
  createAlert: (data) => api.post('/alerts', data),
  updateAlert: (id, data) => api.put(`/alerts/${id}`, data),
  deleteAlert: (id) => api.delete(`/alerts/${id}`)
};

export const aiService = {
  getStatus: () => api.get('/ai/status'),
  chat: (message, history) => api.post('/ai/chat', { message, conversationHistory: history }),
  analyzeText: (data) => api.post('/ai/analyze', data)
};

export const analyticsService = {
  getDashboardAnalytics: () => api.get('/analytics')
};

export const userService = {
  getAllUsers: (params) => api.get('/users', { params }),
  updateUserRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  updateVolunteerStatus: (data) => api.patch('/users/volunteer/status', data),
  deleteUser: (id) => api.delete(`/users/${id}`)
};

export default api;
