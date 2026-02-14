import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../../../hooks/useAuth';
import { AuthContext, type AuthContextType } from '../../../contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Create wrapper with providers
const createWrapper = (authContextValue: AuthContextType) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authContextValue}>
          {children}
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };
};

describe('useAuth', () => {
  const mockAuthContext: AuthContextType = {
    user: {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
    },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
  };

  it('should return auth context when used within AuthProvider', () => {
    const wrapper = createWrapper(mockAuthContext);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockAuthContext.user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should throw error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });

  it('should provide login function', () => {
    const wrapper = createWrapper(mockAuthContext);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.login).toBe('function');
  });

  it('should provide logout function', () => {
    const wrapper = createWrapper(mockAuthContext);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.logout).toBe('function');
  });

  it('should provide checkAuth function', () => {
    const wrapper = createWrapper(mockAuthContext);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.checkAuth).toBe('function');
  });

  it('should handle unauthenticated state', () => {
    const unauthenticatedContext: AuthContextType = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    };

    const wrapper = createWrapper(unauthenticatedContext);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle loading state', () => {
    const loadingContext: AuthContextType = {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    };

    const wrapper = createWrapper(loadingContext);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });
});
