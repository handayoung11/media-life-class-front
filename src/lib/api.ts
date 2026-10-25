import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

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

let isRefreshing = false;
let pendingQueue: Array<{
  config: InternalAxiosRequestConfig;
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(token: string | null, error: unknown) {
  pendingQueue.forEach((p) => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  pendingQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const res = await axios.post<string>(
    `${BASE_URL}/token/refresh`,
    {},
    { withCredentials: true }
  );
  const newToken = res.data;
  if (!newToken) {
    throw new Error('Refresh response missing token');
  }
  localStorage.setItem('token', newToken);
  return newToken;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = error.response?.status;

    if (status !== 401) {
      return Promise.reject(error);
    }

    const resp = error.response;
    const authHeader = resp?.headers['www-authenticate'] as string | undefined;
    const isExpired = authHeader?.includes('expired');

    if (isExpired && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ config: originalRequest, resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        });
      }

      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        processQueue(newToken, null);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshErr) {
        processQueue(null, refreshErr);
        localStorage.removeItem('token');
        const path = window.location.pathname;
        if (path !== '/login') {
          window.location.replace('/login');
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // 일반 401 (토큰 없음 / 잘못된 토큰 / refresh 실패)
    const path = window.location.pathname;
    if (path !== '/login' && !path.startsWith('/dashboard')) {
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('token');
}

export function logout(): void {
  axios.post(`${BASE_URL}/logout`, {}).catch(e => {
    console.error('Logout request failed:', e);
  });
  localStorage.removeItem('token');
  window.location.replace('/login');
}

export const API_BASE_URL = BASE_URL;
