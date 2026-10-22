import axios, { AxiosError } from 'axios';

const BASE_URL = 'http://localhost:8080';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const resp = error.response;
      const authHeader = resp.headers['www-authenticate'];
      
      // 만료된 경우 Refresh token 발급 후 재요청
      if (authHeader && authHeader.includes('expired')) {
        const newAccessToken = api.post('/token/refresh');
        // config.headers['Authorization'] = `Bearer ${newAccessToken}`;
        // return axios(config);
      }
      if (path !== '/login' && !path.startsWith('/dashboard')) {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('token');
}

export function logout(): void {
  localStorage.removeItem('token');
  window.location.replace('/login');
}

export const API_BASE_URL = BASE_URL;
