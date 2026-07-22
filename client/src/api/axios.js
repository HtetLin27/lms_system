import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Endpoints where a 401 is a legitimate answer ("wrong password"), not an
// expired session. Logging the user out here would wipe the form's error state
// before it could render.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthAttempt = AUTH_ENDPOINTS.some((path) => url.includes(path));

    if (error.response?.status === 401 && !isAuthAttempt) {
      // Token expired or invalid. Clearing the user trips ProtectedRoute into
      // a client-side redirect, so we keep the SPA alive instead of reloading.
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
