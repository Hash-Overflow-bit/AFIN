import axios from 'axios';

// Base API instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach token
api.interceptors.request.use(
  (config) => {
    // We only access localStorage in the browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          // Try to refresh
          const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken,
          });

          // Save new tokens
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, log user out
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
