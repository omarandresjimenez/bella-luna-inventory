import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { getFrontendEnv } from '../config/env';
import { getSessionId, setSessionId } from '../utils/sessionStorage';
import type { ApiResponse } from '../types';

const env = getFrontendEnv();
const API_URL = env.VITE_API_URL;

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Check for admin token first, then customer token
        const token = localStorage.getItem('token') || localStorage.getItem('customerToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add session ID for anonymous users (cart)
        const sessionId = getSessionId();
        if (sessionId && !token) {
          config.headers['X-Session-Id'] = sessionId;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Capture session ID from response header if present
        const sessionId = response.headers['x-session-id'];
        if (sessionId && typeof sessionId === 'string') {
          setSessionId(sessionId);
        }

        return response;
      },
      (error: AxiosError<ApiResponse<unknown>>) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('customerToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, params?: Record<string, unknown>) {
    return this.client.get<ApiResponse<T>>(url, { params });
  }

  post<T>(url: string, data?: unknown) {
    return this.client.post<ApiResponse<T>>(url, data);
  }

  put<T>(url: string, data?: unknown) {
    return this.client.put<ApiResponse<T>>(url, data);
  }

  patch<T>(url: string, data?: unknown) {
    return this.client.patch<ApiResponse<T>>(url, data);
  }

  delete<T>(url: string) {
    return this.client.delete<ApiResponse<T>>(url);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
