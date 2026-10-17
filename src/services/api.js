import axios from 'axios';

/**
 * Dynamically resolve backend base URL:
 * - If user saved a custom tunnel URL in localStorage ('custom_api_url'), prioritize it.
 * - If VITE_API_URL is configured in Vercel environment variables or .env.production, use that.
 * - In local dev with Vite reverse proxy, empty string '' routes '/api' requests through Vite
 *   to http://127.0.0.1:8000 seamlessly for both desktop and mobile devices.
 */
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('custom_api_url');
    if (customUrl && customUrl.trim().length > 0) {
      return customUrl.trim().replace(/\/$/, '');
    }
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof window === 'undefined') return 'http://localhost:8000';
  return '';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000,
});

// Request interceptor to automatically insert authorization token
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

export default api;
