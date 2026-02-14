import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCustomerAuth } from '../../../hooks/useCustomerAuth';
import { CustomerAuthContext, type CustomerAuthContextType } from '../../../contexts/CustomerAuthContext';
import { ReactNode } from 'react';

const createWrapper = (contextValue: CustomerAuthContextType) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <CustomerAuthContext.Provider value={contextValue}>
        {children}
      </CustomerAuthContext.Provider>
    );
  };
};

describe('useCustomerAuth', () => {
  const mockCustomerContext: CustomerAuthContextType = {
    customer: {
      id: 'cust-1',
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-1234',
      isVerified: true,
    },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    verifyEmail: vi.fn(),
  };

  it('should return customer context when used within CustomerAuthProvider', () => {
    const wrapper = createWrapper(mockCustomerContext);
    const { result } = renderHook(() => useCustomerAuth(), { wrapper });

    expect(result.current.customer).toEqual(mockCustomerContext.customer);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should have access to login function', () => {
    const wrapper = createWrapper(mockCustomerContext);
    const { result } = renderHook(() => useCustomerAuth(), { wrapper });

    expect(typeof result.current.login).toBe('function');
  });

  it('should have access to register function', () => {
    const wrapper = createWrapper(mockCustomerContext);
    const { result } = renderHook(() => useCustomerAuth(), { wrapper });

    expect(typeof result.current.register).toBe('function');
  });

  it('should have access to logout function', () => {
    const wrapper = createWrapper(mockCustomerContext);
    const { result } = renderHook(() => useCustomerAuth(), { wrapper });

    expect(typeof result.current.logout).toBe('function');
  });

  it('should have access to verifyEmail function', () => {
    const wrapper = createWrapper(mockCustomerContext);
    const { result } = renderHook(() => useCustomerAuth(), { wrapper });

    expect(typeof result.current.verifyEmail).toBe('function');
  });

  it('should handle unauthenticated state', () => {
    const unauthenticatedContext: CustomerAuthContextType = {
      customer: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      verifyEmail: vi.fn(),
    };

    const wrapper = createWrapper(unauthenticatedContext);
    const { result } = renderHook(() => useCustomerAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.customer).toBeNull();
  });

  it('should handle loading state', () => {
    const loadingContext: CustomerAuthContextType = {
      customer: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      verifyEmail: vi.fn(),
    };

    const wrapper = createWrapper(loadingContext);
    const { result } = renderHook(() => useCustomerAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle error state', () => {
    const errorContext: CustomerAuthContextType = {
      customer: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Authentication failed',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      verifyEmail: vi.fn(),
    };

    const wrapper = createWrapper(errorContext);
    const { result } = renderHook(() => useCustomerAuth(), { wrapper });

    expect(result.current.error).toBe('Authentication failed');
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useCustomerAuth());
    }).toThrow('useCustomerAuth must be used within a CustomerAuthProvider');

    consoleError.mockRestore();
  });
});
