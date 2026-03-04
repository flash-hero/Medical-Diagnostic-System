import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8888';
const AI_API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getUsers: () => api.get('/auth/users'),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// Patient APIs
export const patientAPI = {
  getDashboardStats: () => api.get('/api/patients/dashboard-stats'),
  getAppointments: () => api.get('/api/appointments/my'),
  bookAppointment: (data) => api.post('/api/appointments/book', data),
  cancelAppointment: (id) => api.put(`/api/appointments/${id}/cancel`),
  getHistory: () => api.get('/api/patients/history'),
  getProfile: () => api.get('/api/patients/profile'),
  updateProfile: (data) => api.put('/api/patients/profile', data),
};

// Doctor APIs
export const doctorAPI = {
  getAllDoctors: () => api.get('/doctors/all'),
  getActiveDoctors: () => api.get('/doctors/active'),
  getAppointments: (doctorName) => api.get(`/doctors/appointments/${doctorName}`),
  updateAppointmentStatus: (id, status) => api.put(`/doctors/appointments/${id}/status?status=${status}`),
  getStats: (doctorName) => api.get(`/api/appointments/doctor/${doctorName}/stats`),
  getNotes: (patientUsername) => api.get(`/api/appointments/notes/${patientUsername}`),
  addNote: (note) => api.post('/api/appointments/notes', note),
};

// Admin APIs
export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: () => api.get('/auth/users'),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  suspendUser: (id, endDate) => api.put(`/auth/users/${id}/suspend`, { endDate: endDate || null }),
  unsuspendUser: (id) => api.put(`/auth/users/${id}/unsuspend`, {}),
  approveDoctor: (id) => api.put(`/auth/users/${id}/approve`, {}),
};

export const profileAPI = {
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// AI APIs
export const aiAPI = {
  chat: (message) => axios.post(`${AI_API_URL}/chat/message`, { 
    message: message, 
    context: "" 
  }).then(response => ({ data: response.data.reply })),
  predictDisease: (data) => axios.post(`${AI_API_URL}/disease/predict`, data),
  scanCancer: (formData) => axios.post(`${AI_API_URL}/cancer/scan`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Message APIs
export const messageAPI = {
  getConversations: () => api.get('/api/messages/conversations'),
  getHistory: (otherUsername) => api.get(`/api/messages/history/${otherUsername}`),
  sendMessage: (receiverUsername, content) => api.post('/api/messages/send', { receiverUsername, content }),
  markAsRead: (otherUsername) => api.put(`/api/messages/read/${otherUsername}`),
  startConversation: (receiverUsername, content) => api.post('/api/messages/start', { receiverUsername, content }),
};

export default api;
