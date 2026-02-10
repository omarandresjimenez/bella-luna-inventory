import { apiClient } from './apiClient';
import type { User, Customer } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate?: string;
}

export const authApi = {
  // Admin/User authentication
  login: (credentials: LoginCredentials) =>
    apiClient.post<{ user: User; token: string }>('/auth/login', credentials),

  register: (data: RegisterData & { role?: string }) =>
    apiClient.post<{ user: User; token: string }>('/auth/register', data),

  logout: () => apiClient.post<void>('/auth/logout'),

  getMe: () => apiClient.get<User>('/auth/me'),

  // Customer authentication
  customerLogin: (credentials: LoginCredentials) =>
    apiClient.post<{ customer: Customer; token: string }>('/auth/customer/login', credentials),

  customerRegister: (data: RegisterData) =>
    apiClient.post<{ customer: Customer; token: string }>('/auth/customer/register', data),

  customerLogout: () => apiClient.post<void>('/auth/customer/logout'),

  getCustomerMe: () => apiClient.get<Customer>('/auth/customer/me'),
};

export default authApi;
