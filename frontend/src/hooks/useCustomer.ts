import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import customerApi from '../services/customerApi';
import type { Address } from '../types';

const QUERY_KEYS = {
  cart: 'cart',
  orders: 'orders',
  order: (id: string) => ['order', id],
  addresses: 'addresses',
};

// Cart
export function useCart() {
  const query = useQuery({
    queryKey: [QUERY_KEYS.cart],
    queryFn: async () => {

      const response = await customerApi.getCart();

      return response.data.data;
    },
  });
  

  return query;
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ variantId, quantity }: { variantId: string; quantity: number }) => {

      const response = await customerApi.addToCart({ variantId, quantity });


      return response.data.data;
    },
    onSuccess: (data) => {

      // Update cache directly first
      queryClient.setQueryData([QUERY_KEYS.cart], data);

      // Then invalidate to trigger a refetch
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.cart] });

    },
    onError: () => {

    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {

      const response = await customerApi.updateCartItem(itemId, { quantity });

      return response.data.data;
    },
    onSuccess: (data) => {

      queryClient.setQueryData([QUERY_KEYS.cart], data);

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.cart] });

    },
    onError: () => {},
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {

      const response = await customerApi.removeCartItem(itemId);

      return response.data.data;
    },
    onSuccess: (data) => {

      queryClient.setQueryData([QUERY_KEYS.cart], data);

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.cart] });

    },
    onError: () => {},
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {

      const response = await customerApi.clearCart();

      return response.data.data;
    },
    onSuccess: (data) => {

      queryClient.setQueryData([QUERY_KEYS.cart], data);

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.cart] });

    },
    onError: () => {},
  });
}

// Orders
export function useOrders() {
  return useQuery({
    queryKey: [QUERY_KEYS.orders],
    queryFn: async () => {
      const response = await customerApi.getOrders();
      // API response: { success: true, data: { orders: [], pagination: {} } }
      return response.data.data.orders || [];
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.order(id),
    queryFn: async () => {
      const response = await customerApi.getOrderById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      shippingAddress: Address;
      deliveryType: 'HOME_DELIVERY' | 'STORE_PICKUP';
      paymentMethod: 'CASH_ON_DELIVERY' | 'STORE_PAYMENT';
      customerNotes?: string;
    }) => {
      const response = await customerApi.createOrder(data as any);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.cart] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.orders] });
    },
  });
}

// Addresses
export function useAddresses() {
  return useQuery({
    queryKey: [QUERY_KEYS.addresses],
    queryFn: async () => {
      const response = await customerApi.getAddresses();
      return response.data.data;
    },
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Address, 'id'>) => {
      const response = await customerApi.createAddress(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.addresses] });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Address> }) => {
      const response = await customerApi.updateAddress(id, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.addresses] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await customerApi.deleteAddress(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.addresses] });
    },
  });
}
