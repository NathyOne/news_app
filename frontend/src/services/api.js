import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// News API
export const newsAPI = {
  getNews: (params = {}) => api.get('/news/', { params }),
  fetchNews: (data) => api.post('/news/fetch/', data),
  getNewsItem: (id) => api.get(`/news/${id}/`),
};

// Filters API
export const filtersAPI = {
  getFilters: () => api.get('/filters/'),
  getFilter: (id) => api.get(`/filters/${id}/`),
  createFilter: (data) => api.post('/filters/', data),
  updateFilter: (id, data) => api.put(`/filters/${id}/`, data),
  deleteFilter: (id) => api.delete(`/filters/${id}/`),
  applyFilter: (id, data) => api.post(`/filters/${id}/apply/`, data),
};

// Alerts API
export const alertsAPI = {
  getAlerts: () => api.get('/alerts/'),
  getAlert: (id) => api.get(`/alerts/${id}/`),
  createAlert: (data) => api.post('/alerts/', data),
  updateAlert: (id, data) => api.put(`/alerts/${id}/`, data),
  deleteAlert: (id) => api.delete(`/alerts/${id}/`),
  testAlert: (id, data) => api.post(`/alerts/${id}/test/`, data),
  processAllAlerts: (data) => api.post('/alerts/process_all/', data),
};

// Alert History API
export const alertHistoryAPI = {
  getAlertHistory: (params = {}) => api.get('/alert-history/', { params }),
};

export default api;

