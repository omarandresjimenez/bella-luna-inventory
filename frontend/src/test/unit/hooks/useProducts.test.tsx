import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useCategories,
  useCategory,
  useProducts,
  useFeaturedProducts,
  useProduct,
  useProductsByCategory,
} from '../../../hooks/useProducts';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

// Create wrapper with QueryClient
const createWrapper = () => {
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
        {children}
      </QueryClientProvider>
    );
  };
};

describe('useProducts hooks', () => {
  const wrapper = createWrapper();

  describe('useCategories', () => {
    it('should fetch categories successfully', async () => {
      const { result } = renderHook(() => useCategories(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);
    });

    it('should handle error response', async () => {
      server.use(
        http.get('/api/categories', () => {
          return HttpResponse.json(
            { success: false, error: 'Failed to fetch categories' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useCategories(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useCategory', () => {
    it('should fetch category by slug', async () => {
      const { result } = renderHook(() => useCategory('test-category'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
    });

    it('should not fetch when slug is empty', async () => {
      const { result } = renderHook(() => useCategory(''), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle 404 for non-existent category', async () => {
      server.use(
        http.get('/api/categories/non-existent', () => {
          return HttpResponse.json(
            { success: false, error: 'Category not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useCategory('non-existent'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useProducts', () => {
    it('should fetch products without params', async () => {
      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
    });

    it('should fetch products with filters', async () => {
      const params = {
        page: 1,
        limit: 10,
        category: 'test-category',
        search: 'test',
        minPrice: 10,
        maxPrice: 100,
        sortBy: 'price',
        sortOrder: 'asc' as const,
      };

      const { result } = renderHook(() => useProducts(params), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('should handle empty response', async () => {
      server.use(
        http.get('/api/products', () => {
          return HttpResponse.json({
            success: true,
            data: [],
          });
        })
      );

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('should handle paginated response', async () => {
      server.use(
        http.get('/api/products', () => {
          return HttpResponse.json({
            success: true,
            data: {
              products: [{ id: '1', name: 'Test' }],
              pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
            },
          });
        })
      );

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(Array.isArray(result.current.data)).toBe(true);
    });
  });

  describe('useFeaturedProducts', () => {
    it('should fetch featured products', async () => {
      const { result } = renderHook(() => useFeaturedProducts(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
    });

    it('should return empty array when no featured products', async () => {
      server.use(
        http.get('/api/products/featured', () => {
          return HttpResponse.json({
            success: true,
            data: [],
          });
        })
      );

      const { result } = renderHook(() => useFeaturedProducts(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });
  });

  describe('useProduct', () => {
    it('should fetch product by slug', async () => {
      const { result } = renderHook(() => useProduct('test-product'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.slug).toBe('test-product');
    });

    it('should not fetch when slug is empty', async () => {
      const { result } = renderHook(() => useProduct(''), { wrapper });

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle product not found', async () => {
      server.use(
        http.get('/api/products/non-existent', () => {
          return HttpResponse.json(
            { success: false, error: 'Product not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useProduct('non-existent'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useProductsByCategory', () => {
    it('should fetch products by category', async () => {
      const { result } = renderHook(
        () => useProductsByCategory('test-category'),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
    });

    it('should fetch with additional params', async () => {
      const params = {
        page: 1,
        limit: 20,
        search: 'query',
        minPrice: 10,
        maxPrice: 100,
        sortBy: 'name',
        sortOrder: 'desc' as const,
      };

      const { result } = renderHook(
        () => useProductsByCategory('test-category', params),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('should handle empty slug (fetch all)', async () => {
      const { result } = renderHook(() => useProductsByCategory(''), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });
});
