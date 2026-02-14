import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useGetOrders,
  useGetOrderById,
  useGetAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from '../../../hooks/useCustomer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import customerApi from '../../../services/customerApi';
import type { Address } from '../../../types';

vi.mock('../../../services/customerApi');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('useCustomer Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCart', () => {
    it('should fetch cart successfully', async () => {
      const mockCart = {
        id: 'cart-1',
        items: [
          {
            id: 'item-1',
            variantId: 'var-1',
            quantity: 2,
            price: 100,
          },
        ],
        total: 200,
        count: 2,
      };

      vi.mocked(customerApi.getCart).mockResolvedValueOnce({
        data: { data: mockCart },
      } as any);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCart);
    });

    it('should handle cart fetch error', async () => {
      const error = new Error('Failed to fetch cart');
      vi.mocked(customerApi.getCart).mockRejectedValueOnce(error);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useAddToCart', () => {
    it('should add item to cart successfully', async () => {
      const mockUpdatedCart = {
        id: 'cart-1',
        items: [
          {
            id: 'item-2',
            variantId: 'var-2',
            quantity: 1,
            price: 50,
          },
        ],
        total: 50,
        count: 1,
      };

      vi.mocked(customerApi.addToCart).mockResolvedValueOnce({
        data: { data: mockUpdatedCart },
      } as any);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAddToCart(), { wrapper });

      result.current.mutate({ variantId: 'var-2', quantity: 1 });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUpdatedCart);
    });

    it('should handle add to cart error', async () => {
      const error = new Error('Failed to add to cart');
      vi.mocked(customerApi.addToCart).mockRejectedValueOnce(error);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAddToCart(), { wrapper });

      result.current.mutate({ variantId: 'var-2', quantity: 1 });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useUpdateCartItem', () => {
    it('should update cart item quantity', async () => {
      const mockUpdatedCart = {
        id: 'cart-1',
        items: [
          {
            id: 'item-1',
            variantId: 'var-1',
            quantity: 5,
            price: 100,
          },
        ],
        total: 500,
        count: 5,
      };

      vi.mocked(customerApi.updateCartItem).mockResolvedValueOnce({
        data: { data: mockUpdatedCart },
      } as any);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateCartItem(), { wrapper });

      result.current.mutate({ itemId: 'item-1', quantity: 5 });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.count).toBe(5);
    });
  });

  describe('useRemoveCartItem', () => {
    it('should remove cart item successfully', async () => {
      const mockUpdatedCart = {
        id: 'cart-1',
        items: [],
        total: 0,
        count: 0,
      };

      vi.mocked(customerApi.removeCartItem).mockResolvedValueOnce({
        data: { data: mockUpdatedCart },
      } as any);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useRemoveCartItem(), { wrapper });

      result.current.mutate('item-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.count).toBe(0);
    });
  });

  describe('useGetOrders', () => {
    it('should fetch customer orders', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          total: 250,
          status: 'COMPLETED',
          createdAt: '2024-01-01',
        },
        {
          id: 'order-2',
          orderNumber: 'ORD-002',
          total: 150,
          status: 'PENDING',
          createdAt: '2024-01-02',
        },
      ];

      vi.mocked(customerApi.getOrders).mockResolvedValueOnce({
        data: { data: mockOrders },
      } as any);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useGetOrders(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].orderNumber).toBe('ORD-001');
    });
  });

  describe('useGetAddresses', () => {
    it('should fetch customer addresses', async () => {
      const mockAddresses: Address[] = [
        {
          id: 'addr-1',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
          isDefault: true,
        },
        {
          id: 'addr-2',
          street: '456 Oak Ave',
          city: 'Boston',
          state: 'MA',
          postalCode: '02101',
          country: 'USA',
          isDefault: false,
        },
      ];

      vi.mocked(customerApi.getAddresses).mockResolvedValueOnce({
        data: { data: mockAddresses },
      } as any);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useGetAddresses(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].isDefault).toBe(true);
    });
  });

  describe('useCreateAddress', () => {
    it('should create a new address', async () => {
      const newAddress: Address = {
        id: 'addr-3',
        street: '789 Pine Rd',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'USA',
        isDefault: false,
      };

      vi.mocked(customerApi.createAddress).mockResolvedValueOnce({
        data: { data: newAddress },
      } as any);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateAddress(), { wrapper });

      result.current.mutate({
        street: '789 Pine Rd',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'USA',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.city).toBe('Chicago');
    });

    it('should handle address creation error', async () => {
      const error = new Error('Invalid address');
      vi.mocked(customerApi.createAddress).mockRejectedValueOnce(error);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateAddress(), { wrapper });

      result.current.mutate({
        street: 'Invalid',
        city: '',
        state: '',
        postalCode: '',
        country: 'USA',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useUpdateAddress', () => {
    it('should update an address', async () => {
      const updatedAddress: Address = {
        id: 'addr-1',
        street: '123 Main St Updated',
        city: 'New York',
        state: 'NY',
        postalCode: '10002',
        country: 'USA',
        isDefault: true,
      };

      vi.mocked(customerApi.updateAddress).mockResolvedValueOnce({
        data: { data: updatedAddress },
      } as any);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUpdateAddress(), { wrapper });

      result.current.mutate({
        id: 'addr-1',
        data: { postalCode: '10002' },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.postalCode).toBe('10002');
    });
  });

  describe('useDeleteAddress', () => {
    it('should delete an address', async () => {
      vi.mocked(customerApi.deleteAddress).mockResolvedValueOnce({
        data: { success: true },
      } as any);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteAddress(), { wrapper });

      result.current.mutate('addr-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(customerApi.deleteAddress).toHaveBeenCalledWith('addr-1');
    });
  });
});
