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

// ── 401 Response Interceptor — auto-logout on expired/invalid token ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      localStorage.removeItem('token');
      // Only redirect if not already on a public page
      const publicPaths = ['/login', '/register', '/events', '/registration'];
      const isPublic = publicPaths.some(p => window.location.pathname.startsWith(p));
      if (!isPublic) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login = (data: { email: string; password: string }) => api.post('/auth/login', data);
export const register = (data: { name: string; email: string; password: string; organization?: string }) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const updateMe = (data: Partial<{ name: string; organization: string; password: string; current_password: string }>) => api.put('/auth/me', data);
export const deleteMe = () => api.delete('/auth/me');

// ─── Events ───────────────────────────────────────────────────────────────────
export const createEvent = (data: Record<string, unknown>) => api.post('/events', data);
export const getMyEvents = () => api.get('/events');
export const getEvent = (id: string) => api.get(`/events/${id}`);
export const updateEvent = (id: string, data: Record<string, unknown>) => api.put(`/events/${id}`, data);
export const deleteEvent = (id: string) => api.delete(`/events/${id}`);
export const updateEventStatus = (id: string, status: string) => api.patch(`/events/${id}/status`, { status });
export const duplicateEvent = (id: string) => api.post(`/events/${id}/duplicate`);
export const discoverEvents = (search?: string, category?: string) =>
  api.get('/events/public/discover', { params: { search, category } });
export const getEventBySlug = (slug: string) => api.get(`/events/public/${slug}`);

// ─── Form Fields ──────────────────────────────────────────────────────────────
export const getFormFields = (eventId: string) => api.get(`/events/${eventId}/fields`);
export const addFormField = (eventId: string, data: Record<string, unknown>) => api.post(`/events/${eventId}/fields`, data);
export const updateFormField = (eventId: string, fieldId: string, data: Record<string, unknown>) =>
  api.put(`/events/${eventId}/fields/${fieldId}`, data);
export const deleteFormField = (eventId: string, fieldId: string) =>
  api.delete(`/events/${eventId}/fields/${fieldId}`);

// ─── Registrations ────────────────────────────────────────────────────────────
export const registerForEvent = (data: Record<string, unknown>) => api.post('/registrations', data);
export const getRegistrations = (eventId: string) => api.get(`/events/${eventId}/registrations`);

// ─── Scanner ──────────────────────────────────────────────────────────────────
export const checkIn = (qrCodeId: string) => api.post('/scanner/check-in', { qr_code_id: qrCodeId });
export const verifyQR = (qrCodeId: string) => api.get(`/scanner/verify/${qrCodeId}`);

// ─── Export ───────────────────────────────────────────────────────────────────
export const exportCSV = (eventId: string, status?: string) =>
  api.get(`/export/${eventId}/csv`, { params: { status }, responseType: 'blob' });
export const exportExcel = (eventId: string, status?: string) =>
  api.get(`/export/${eventId}/excel`, { params: { status }, responseType: 'blob' });

export default api;

