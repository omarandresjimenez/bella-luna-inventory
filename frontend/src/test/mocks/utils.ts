import { vi } from 'vitest';
import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '../../types';

// Mock API response helper
export function createMockResponse<T>(data: T): AxiosResponse<ApiResponse<T>> {
  return {
    data: {
      success: true,
      data,
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

// Mock localStorage
export function setupLocalStorageMock() {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  
  return localStorageMock;
}

// Mock API client
export function mockApiClient() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
}
