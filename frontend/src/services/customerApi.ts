import { apiClient } from './apiClient';
import type { Cart, Order, Address } from '../types';

interface AddToCartData {
  variantId: string;
  quantity: number;
}

interface UpdateCartItemData {
  quantity: number;
}

interface CreateOrderData {
  addressId: string;
  deliveryType: 'HOME_DELIVERY' | 'STORE_PICKUP';
  paymentMethod: 'CASH_ON_DELIVERY' | 'STORE_PAYMENT';
  customerNotes?: string;
}

export const customerApi = {
  // Cart
  getCart: () =>
    apiClient.get<Cart>('/cart'),

  addToCart: (data: AddToCartData) =>
    apiClient.post<Cart>('/cart/items', data),

  updateCartItem: (itemId: string, data: UpdateCartItemData) =>
    apiClient.patch<Cart>(`/cart/items/${itemId}`, data),

  removeCartItem: (itemId: string) =>
    apiClient.delete<Cart>(`/cart/items/${itemId}`),

  clearCart: () =>
    apiClient.delete<Cart>('/cart'),

  // Orders
  getOrders: () =>
    apiClient.get<Order[]>('/orders'),

  getOrderById: (id: string) =>
    apiClient.get<Order>(`/orders/${id}`),

  createOrder: (data: CreateOrderData) =>
    apiClient.post<Order>('/orders', data),

  // Addresses
  getAddresses: () =>
    apiClient.get<Address[]>('/addresses'),

  createAddress: (data: Omit<Address, 'id'>) =>
    apiClient.post<Address>('/addresses', data),

  updateAddress: (id: string, data: Partial<Address>) =>
    apiClient.patch<Address>(`/addresses/${id}`, data),

  deleteAddress: (id: string) =>
    apiClient.delete<void>(`/addresses/${id}`),
};

export default customerApi;
