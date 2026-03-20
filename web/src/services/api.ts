import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (data: { email: string; password: string }) => api.post('/auth/login', data);
export const register = (data: any) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const updateMe = (data: any) => api.put('/auth/me', data);
export const deleteMe = () => api.delete('/auth/me');

// Events
export const createEvent = (data: any) => api.post('/events', data);
export const getMyEvents = () => api.get('/events');
export const getEvent = (id: string) => api.get(`/events/${id}`);
export const updateEvent = (id: string, data: any) => api.put(`/events/${id}`, data);
export const deleteEvent = (id: string) => api.delete(`/events/${id}`);
export const updateEventStatus = (id: string, status: string) => api.patch(`/events/${id}/status`, { status });
export const discoverEvents = (search?: string, category?: string) =>
  api.get('/events/public/discover', { params: { search, category } });
export const getEventBySlug = (slug: string) => api.get(`/events/public/${slug}`);

// Form Fields
export const getFormFields = (eventId: string) => api.get(`/events/${eventId}/fields`);
export const addFormField = (eventId: string, data: any) => api.post(`/events/${eventId}/fields`, data);
export const updateFormField = (eventId: string, fieldId: string, data: any) =>
  api.put(`/events/${eventId}/fields/${fieldId}`, data);
export const deleteFormField = (eventId: string, fieldId: string) =>
  api.delete(`/events/${eventId}/fields/${fieldId}`);

// Registrations
export const registerForEvent = (data: any) => api.post('/registrations', data);
export const getRegistrations = (eventId: string) => api.get(`/events/${eventId}/registrations`);

// Scanner
export const checkIn = (qrCodeId: string) => api.post('/scanner/check-in', { qr_code_id: qrCodeId });
export const verifyQR = (qrCodeId: string) => api.get(`/scanner/verify/${qrCodeId}`);

// Export
export const exportCSV = (eventId: string, status?: string) =>
  api.get(`/export/${eventId}/csv`, { params: { status }, responseType: 'blob' });
export const exportExcel = (eventId: string, status?: string) =>
  api.get(`/export/${eventId}/excel`, { params: { status }, responseType: 'blob' });

export default api;
