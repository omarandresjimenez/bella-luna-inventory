import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { 
  useCategories, 
  useProducts, 
  useProduct,
  useFeaturedProducts 
} from '../../hooks/useProducts';
import * as publicApi from '../../services/publicApi';
import { mockProduct, mockCategory, createMockResponse } from '../mocks/data';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
    },
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useProducts Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch products successfully', async () => {
    vi.spyOn(publicApi, 'getProducts').mockResolvedValue(
      createMockResponse([mockProduct])
    );

    const { result } = renderHook(() => useProducts(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].name).toBe('Wireless Headphones');
  });

  it('should fetch featured products', async () => {
    vi.spyOn(publicApi, 'getFeaturedProducts').mockResolvedValue(
      createMockResponse([mockProduct])
    );

    const { result } = renderHook(() => useFeaturedProducts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
  });

  it('should fetch single product by slug', async () => {
    vi.spyOn(publicApi, 'getProductBySlug').mockResolvedValue(
      createMockResponse(mockProduct)
    );

    const { result } = renderHook(() => useProduct('wireless-headphones'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.name).toBe('Wireless Headphones');
    expect(result.current.data?.slug).toBe('wireless-headphones');
  });

  it('should handle error state', async () => {
    vi.spyOn(publicApi, 'getProducts').mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useProducts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});

describe('useCategories Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch categories', async () => {
    vi.spyOn(publicApi, 'getCategories').mockResolvedValue(
      createMockResponse([mockCategory])
    );

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].name).toBe('Electronics');
  });

  it('should fetch single category by slug', async () => {
    vi.spyOn(publicApi, 'getCategoryBySlug').mockResolvedValue(
      createMockResponse(mockCategory)
    );

    const { result } = renderHook(() => useCategory('electronics'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.name).toBe('Electronics');
  });
});
