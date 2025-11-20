import axios, { type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_VERSION_PREFIX } from '@/api/config';
import { getValidAccessToken } from '@/api/authManager';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

function isPublicRequest(config: InternalAxiosRequestConfig): boolean {
  const method = (config.method ?? 'get').toUpperCase();
  let url = config.url ?? '';

  const qIndex = url.indexOf('?');
  if (qIndex !== -1) {
    url = url.slice(0, qIndex);
  }

  if (!url.startsWith('/')) {
    url = `/${url}`;
  }

  // POST /api/v1/user (registration)
  if (method === 'POST' && url === '/user') {
    return true;
  }

  // ANY /api/v1/auth/**
  if (url === '/auth' || url.startsWith('/auth/')) {
    return true;
  }

  // ANY /api/v1/rdi/**
  if (url === '/rdi' || url.startsWith('/rdi/')) {
    return true;
  }

  // ANY /api/v1/metadata/**
  if (url === '/metadata' || url.startsWith('/metadata/')) {
    return true;
  }

  // ANY /api/v1/food-components/catalog/**
  if (url === '/food-components/catalog' || url.startsWith('/food-components/catalog/')) {
    return true;
  }

  return false;
}

apiClient.interceptors.request.use(
  async (config) => {
    const originalUrl = config.url;

    if (isPublicRequest(config)) {
      console.log('[API] public request →', config.method, originalUrl);
      return config;
    }

    const token = await getValidAccessToken();
    console.log('[API] secured request →', config.method, originalUrl, 'token?', !!token);

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);
