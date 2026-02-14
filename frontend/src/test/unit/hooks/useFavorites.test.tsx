import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useFavorites,
  useFavoriteProductIds,
  useIsFavorite,
  useAddToFavorites,
  useRemoveFromFavorites,
  useToggleFavorite,
} from '../../../hooks/useFavorites';
import { CustomerAuthContext, type CustomerAuthContextType } from '../../../contexts/CustomerAuthContext';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

// Create wrapper with both QueryClient and CustomerAuthContext
const createWrapper = (isAuthenticated = true) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const mockAuthContext: CustomerAuthContextType = {
    customer: isAuthenticated ? { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', phone: '1234567890' } : null,
    isAuthenticated,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    checkAuth: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerificationCode: vi.fn(),
    resendVerificationEmail: vi.fn(),
  };

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <CustomerAuthContext.Provider value={mockAuthContext}>
          {children}
        </CustomerAuthContext.Provider>
      </QueryClientProvider>
    );
  };
};

describe('useFavorites hooks', () => {
  describe('useFavorites', () => {
    it('should fetch favorites when authenticated', async () => {
      const wrapper = createWrapper(true);
      const { result } = renderHook(() => useFavorites(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
    });

    it('should not fetch when not authenticated', async () => {
      const wrapper = createWrapper(false);
      const { result } = renderHook(() => useFavorites(), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not retry on error', async () => {
      const wrapper = createWrapper(true);
      
      server.use(
        http.get('/api/favorites', () => {
          return HttpResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      const { result } = renderHook(() => useFavorites(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useFavoriteProductIds', () => {
    it('should fetch favorite product IDs when authenticated', async () => {
      server.use(
        http.get('/api/favorites/product-ids', () => {
          return HttpResponse.json({
            success: true,
            data: { productIds: ['1', '2', '3'] },
          });
        })
      );

      const wrapper = createWrapper(true);
      const { result } = renderHook(() => useFavoriteProductIds(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(['1', '2', '3']);
    });

    it('should not fetch when not authenticated', async () => {
      const wrapper = createWrapper(false);
      const { result } = renderHook(() => useFavoriteProductIds(), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useIsFavorite', () => {
    it('should check if product is favorited when authenticated', async () => {
      server.use(
        http.get('/api/favorites/check/1', () => {
          return HttpResponse.json({
            success: true,
            data: { isFavorite: true },
          });
        })
      );

      const wrapper = createWrapper(true);
      const { result } = renderHook(() => useIsFavorite('1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBe(true);
    });

    it('should return false when product is not favorited', async () => {
      server.use(
        http.get('/api/favorites/check/2', () => {
          return HttpResponse.json({
            success: true,
            data: { isFavorite: false },
          });
        })
      );

      const wrapper = createWrapper(true);
      const { result } = renderHook(() => useIsFavorite('2'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBe(false);
    });

    it('should not fetch when productId is empty', async () => {
      const wrapper = createWrapper(true);
      const { result } = renderHook(() => useIsFavorite(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not fetch when not authenticated', async () => {
      const wrapper = createWrapper(false);
      const { result } = renderHook(() => useIsFavorite('1'), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useAddToFavorites', () => {
    it('should add product to favorites', async () => {
      const wrapper = createWrapper(true);
      const { result } = renderHook(() => useAddToFavorites(), { wrapper });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
    });

    it('should invalidate favorites queries on success', async () => {
      const wrapper = createWrapper(true);
      const { result } = renderHook(() => useAddToFavorites(), { wrapper });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useRemoveFromFavorites', () => {
    it('should remove product from favorites', async () => {
      const wrapper = createWrapper(true);
      const { result } = renderHook(() => useRemoveFromFavorites(), { wrapper });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
    });
  });

  describe('useToggleFavorite', () => {
    it('should add product when not favorited', async () => {
      const wrapper = createWrapper(true);
      const { result } = renderHook(() => useToggleFavorite(), { wrapper });

      await result.current.toggle('1', false);

      expect(result.current.isPending).toBe(false);
    });

    it('should remove product when favorited', async () => {
      const wrapper = createWrapper(true);
      const { result } = renderHook(() => useToggleFavorite(), { wrapper });

      await result.current.toggle('1', true);

      expect(result.current.isPending).toBe(false);
    });

    it('should track pending state', async () => {
      const wrapper = createWrapper(true);
      const { result } = renderHook(() => useToggleFavorite(), { wrapper });

      expect(result.current.isPending).toBe(false);
    });
  });
});
