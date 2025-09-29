import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  getMe: () => api.get('/users/me'),
};

export const bugsAPI = {
  getAll: () => api.get('/bugs'),
  getById: (id) => api.get(`/bugs/${id}`),
  create: (data) => api.post('/bugs', data),
  updateStatus: (id, status) => api.put(`/bugs/${id}/status`, { status }),
  approve: (id) => api.put(`/bugs/${id}/approve`),
};

export default api;
