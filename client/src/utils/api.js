import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002';

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.warn('getImageUrl: No image path provided');
    return '';
  }
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    console.log('getImageUrl: Full URL detected:', imagePath);
    return imagePath;
  }
  // Otherwise, prepend the base URL
  const fullUrl = `${BASE_URL}${imagePath}`;
  console.log('getImageUrl: Constructed URL:', fullUrl, 'from path:', imagePath);
  return fullUrl;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => {
    // Check if data is FormData (for admin registration with image)
    const headers = data instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };
    
    return api.post('/auth/register', data, { headers });
  },
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Report APIs
export const reportAPI = {
  create: (formData) => {
    return api.post('/department-reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getAll: (params) => api.get('/department-reports', { params }),
  getAllReports: (params) => api.get('/department-reports/all', { params }), // All reports across all departments
  getById: (id) => api.get(`/department-reports/${id}`),
  update: (id, data) => api.patch(`/department-reports/${id}`, data),
  delete: (id) => api.delete(`/department-reports/${id}`)
};

// Stats APIs
export const statsAPI = {
  getDashboard: () => api.get('/stats')
};

// Notification APIs
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (notificationId) => api.post('/notifications/mark-read', { notificationId })
};

export default api;
