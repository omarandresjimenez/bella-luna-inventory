import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { 
  useCart, 
  useAddToCart, 
  useUpdateCartItem, 
  useRemoveCartItem,
  useCreateOrder 
} from '../../hooks/useCustomer';
import * as customerApi from '../../services/customerApi';
import { mockCart, mockOrder, createMockResponse } from '../mocks/data';

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

describe('Cart Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCart', () => {
    it('should fetch cart successfully', async () => {
      vi.spyOn(customerApi, 'getCart').mockResolvedValue(
        createMockResponse(mockCart)
      );

      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.items).toHaveLength(1);
      expect(result.current.data?.subtotal).toBe(199.98);
    });
  });

  describe('useAddToCart', () => {
    it('should add item to cart', async () => {
      const addToCartMock = vi.spyOn(customerApi, 'addToCart').mockResolvedValue(
        createMockResponse(mockCart)
      );

      const { result } = renderHook(() => useAddToCart(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ variantId: 'v1', quantity: 2 });
      });

      expect(addToCartMock).toHaveBeenCalledWith({ variantId: 'v1', quantity: 2 });
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle add to cart error', async () => {
      vi.spyOn(customerApi, 'addToCart').mockRejectedValue(
        new Error('Out of stock')
      );

      const { result } = renderHook(() => useAddToCart(), { wrapper });

      await act(async () => {
        try {
          await result.current.mutateAsync({ variantId: 'v1', quantity: 100 });
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.isError).toBe(true);
    });
  });

  describe('useUpdateCartItem', () => {
    it('should update cart item quantity', async () => {
      const updateMock = vi.spyOn(customerApi, 'updateCartItem').mockResolvedValue(
        createMockResponse(mockCart)
      );

      const { result } = renderHook(() => useUpdateCartItem(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ itemId: 'item1', quantity: 3 });
      });

      expect(updateMock).toHaveBeenCalledWith('item1', { quantity: 3 });
    });
  });

  describe('useRemoveCartItem', () => {
    it('should remove item from cart', async () => {
      const removeMock = vi.spyOn(customerApi, 'removeCartItem').mockResolvedValue(
        createMockResponse({ ...mockCart, items: [], subtotal: 0 })
      );

      const { result } = renderHook(() => useRemoveCartItem(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync('item1');
      });

      expect(removeMock).toHaveBeenCalledWith('item1');
    });
  });

  describe('useCreateOrder', () => {
    it('should create order successfully', async () => {
      const createOrderMock = vi.spyOn(customerApi, 'createOrder').mockResolvedValue(
        createMockResponse(mockOrder)
      );

      const { result } = renderHook(() => useCreateOrder(), { wrapper });

      const orderData = {
        shippingAddress: mockOrder.shippingAddress,
        deliveryType: 'HOME_DELIVERY' as const,
        paymentMethod: 'CASH_ON_DELIVERY' as const,
      };

      await act(async () => {
        await result.current.mutateAsync(orderData);
      });

      expect(createOrderMock).toHaveBeenCalledWith(orderData);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle order creation error', async () => {
      vi.spyOn(customerApi, 'createOrder').mockRejectedValue(
        new Error('Payment failed')
      );

      const { result } = renderHook(() => useCreateOrder(), { wrapper });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            shippingAddress: mockOrder.shippingAddress,
            deliveryType: 'HOME_DELIVERY',
            paymentMethod: 'CASH_ON_DELIVERY',
          });
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.isError).toBe(true);
    });
  });
});
