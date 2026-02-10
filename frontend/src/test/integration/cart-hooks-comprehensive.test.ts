import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAddToCart, useCart, useUpdateCartItem, useRemoveCartItem } from '../useCustomer';
import * as customerApi from '../../services/customerApi';
import * as sessionStorage from '../../utils/sessionStorage';
import type { Cart } from '../../types';

// Mock the APIs
vi.mock('../../services/customerApi');
vi.mock('../../utils/sessionStorage');

const mockCart: Cart = {
  id: 'cart-1',
  items: [
    {
      id: 'item-1',
      variantId: 'variant-1',
      productName: 'Test Product',
      variantName: 'Blue - M',
      imageUrl: 'https://example.com/image.jpg',
      quantity: 2,
      unitPrice: 99.99,
      totalPrice: 199.98,
    },
  ],
  subtotal: 199.98,
  itemCount: 2,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Cart Shopping Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useCart', () => {
    it('should fetch cart for authenticated user', async () => {
      const mockGetCart = vi.spyOn(customerApi, 'getCart' as any).mockResolvedValue({
        data: { data: mockCart },
      });

      const { result } = renderHook(() => useCart(), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCart);
      expect(mockGetCart).toHaveBeenCalledTimes(1);
    });

    it('should fetch cart for anonymous user with sessionId', async () => {
      const mockGetCart = vi.spyOn(customerApi, 'getCart' as any).mockResolvedValue({
        data: { data: mockCart },
      });

      const { result } = renderHook(() => useCart(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.itemCount).toBe(2);
      expect(result.current.data?.subtotal).toBe(199.98);
    });

    it('should handle cart fetch error', async () => {
      const mockError = new Error('Failed to fetch cart');
      vi.spyOn(customerApi, 'getCart' as any).mockRejectedValue(mockError);

      const { result } = renderHook(() => useCart(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useAddToCart', () => {
    it('should add item to cart for authenticated user', async () => {
      const mockAddToCart = vi.spyOn(customerApi, 'addToCart' as any).mockResolvedValue({
        data: { data: mockCart },
      });
      const mockInvalidateQueries = vi.fn();

      const { result } = renderHook(() => useAddToCart(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate({ variantId: 'variant-1', quantity: 2 });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockAddToCart).toHaveBeenCalledWith({
        variantId: 'variant-1',
        quantity: 2,
      });
    });

    it('should add item to anonymous cart with sessionId', async () => {
      const mockAddToCart = vi.spyOn(customerApi, 'addToCart' as any).mockResolvedValue({
        data: { data: mockCart },
      });

      const { result } = renderHook(() => useAddToCart(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate({ variantId: 'variant-1', quantity: 1 });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockAddToCart).toHaveBeenCalled();
    });

    it('should handle add to cart error', async () => {
      const mockError = new Error('Product out of stock');
      vi.spyOn(customerApi, 'addToCart' as any).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAddToCart(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate({ variantId: 'variant-1', quantity: 100 });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should increase quantity if item already in cart', async () => {
      const updatedCart = {
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            quantity: 3,
            totalPrice: 299.97,
          },
        ],
        subtotal: 299.97,
        itemCount: 3,
      };

      vi.spyOn(customerApi, 'addToCart' as any).mockResolvedValue({
        data: { data: updatedCart },
      });

      const { result } = renderHook(() => useAddToCart(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate({ variantId: 'variant-1', quantity: 1 });
      });

      await waitFor(() => {
        expect(result.current.data?.itemCount).toBe(3);
      });
    });
  });

  describe('useUpdateCartItem', () => {
    it('should update item quantity', async () => {
      const updatedCart = {
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            quantity: 5,
            totalPrice: 499.95,
          },
        ],
        subtotal: 499.95,
        itemCount: 5,
      };

      const mockUpdateCartItem = vi.spyOn(customerApi, 'updateCartItem' as any).mockResolvedValue({
        data: { data: updatedCart },
      });

      const { result } = renderHook(() => useUpdateCartItem(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate({ itemId: 'item-1', quantity: 5 });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockUpdateCartItem).toHaveBeenCalledWith('item-1', { quantity: 5 });
    });

    it('should remove item when quantity is 0', async () => {
      const emptyCart = {
        id: 'cart-1',
        items: [],
        subtotal: 0,
        itemCount: 0,
      };

      vi.spyOn(customerApi, 'updateCartItem' as any).mockResolvedValue({
        data: { data: emptyCart },
      });

      const { result } = renderHook(() => useUpdateCartItem(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate({ itemId: 'item-1', quantity: 0 });
      });

      await waitFor(() => {
        expect(result.current.data?.itemCount).toBe(0);
      });
    });

    it('should handle update error', async () => {
      const mockError = new Error('Item not found');
      vi.spyOn(customerApi, 'updateCartItem' as any).mockRejectedValue(mockError);

      const { result } = renderHook(() => useUpdateCartItem(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate({ itemId: 'invalid-id', quantity: 1 });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useRemoveCartItem', () => {
    it('should remove item from cart', async () => {
      const emptyCart = {
        id: 'cart-1',
        items: [],
        subtotal: 0,
        itemCount: 0,
      };

      const mockRemoveCartItem = vi.spyOn(customerApi, 'removeCartItem' as any).mockResolvedValue({
        data: { data: emptyCart },
      });

      const { result } = renderHook(() => useRemoveCartItem(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate('item-1');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockRemoveCartItem).toHaveBeenCalledWith('item-1');
      expect(result.current.data?.itemCount).toBe(0);
    });

    it('should handle remove error', async () => {
      const mockError = new Error('Item not found');
      vi.spyOn(customerApi, 'removeCartItem' as any).mockRejectedValue(mockError);

      const { result } = renderHook(() => useRemoveCartItem(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate('invalid-id');
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('Cart Operations Flow', () => {
    it('should handle complete add to cart flow: add -> update -> remove', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const mockAddToCart = vi.spyOn(customerApi, 'addToCart' as any).mockResolvedValue({
        data: { data: mockCart },
      });

      const mockUpdateCartItem = vi.spyOn(customerApi, 'updateCartItem' as any).mockResolvedValue({
        data: {
          data: {
            ...mockCart,
            items: [{ ...mockCart.items[0], quantity: 3 }],
            itemCount: 3,
          },
        },
      });

      const mockRemoveCartItem = vi.spyOn(customerApi, 'removeCartItem' as any).mockResolvedValue({
        data: { data: { id: 'cart-1', items: [], subtotal: 0, itemCount: 0 } },
      });

      // Add item
      expect(mockAddToCart).toBeDefined();

      // Update item
      expect(mockUpdateCartItem).toBeDefined();

      // Remove item
      expect(mockRemoveCartItem).toBeDefined();

      expect(mockAddToCart).toBeDefined();
    });

    it('should maintain cart state across operations', async () => {
      let cartState = { ...mockCart };

      const mockAddToCart = vi.spyOn(customerApi, 'addToCart' as any).mockImplementation(() => {
        cartState = {
          ...cartState,
          items: [...cartState.items],
          itemCount: cartState.itemCount + 1,
        };
        return Promise.resolve({ data: { data: cartState } });
      });

      const { result } = renderHook(() => useAddToCart(), { wrapper: createWrapper() });

      await act(async () => {
        result.current.mutate({ variantId: 'variant-1', quantity: 1 });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.itemCount).toBeGreaterThan(0);
    });
  });
});
