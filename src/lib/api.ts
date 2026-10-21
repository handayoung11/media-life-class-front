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
      localStorage.removeItem('token');
      const path = window.location.pathname;
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

export function loginWithGoogle(): void {
  window.location.replace(`${BASE_URL}/oauth2/authorization/google`);
}

export const API_BASE_URL = BASE_URL;
