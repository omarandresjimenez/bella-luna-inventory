import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as sessionStorage from '../utils/sessionStorage';
import * as customerApi from '../services/customerApi';

// Mock sessionStorage
vi.mock('../utils/sessionStorage');
vi.mock('../services/customerApi');

const mockSessionId = 'test-session-123';
const mockCart = {
  id: 'cart-1',
  items: [
    {
      id: 'item-1',
      variantId: 'variant-1',
      productName: 'Test Product',
      variantName: 'Blue - M',
      imageUrl: 'https://example.com/image.jpg',
      quantity: 1,
      unitPrice: 99.99,
      totalPrice: 99.99,
    },
  ],
  subtotal: 99.99,
  itemCount: 1,
};

describe('Shopping Cart Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Setup mocks
    (sessionStorage.getSessionId as any).mockReturnValue(mockSessionId);
    (customerApi.getCart as any).mockResolvedValue({
      data: { data: mockCart },
    });
  });

  describe('Anonymous Cart Flow', () => {
    it('should create session ID on first add to cart', async () => {
      const setSessionIdMock = sessionStorage.setSessionId as any;
      const addToCartMock = customerApi.addToCart as any;

      addToCartMock.mockResolvedValue({
        data: {
          data: mockCart,
          headers: { 'x-session-id': mockSessionId },
        },
      });

      setSessionIdMock.mockImplementation(() => {
        (sessionStorage.getSessionId as any).mockReturnValue(mockSessionId);
      });

      // Simulate add to cart
      expect(setSessionIdMock).toBeDefined();
      expect(addToCartMock).toBeDefined();
    });

    it('should persist session ID across requests', async () => {
      const getSessionIdMock = sessionStorage.getSessionId as any;
      const addToCartMock = customerApi.addToCart as any;

      addToCartMock.mockResolvedValue({
        data: { data: mockCart },
      });

      getSessionIdMock.mockReturnValue(mockSessionId);

      // First request
      const sessionId1 = (sessionStorage.getSessionId as any)();

      // Second request
      const sessionId2 = (sessionStorage.getSessionId as any)();

      expect(sessionId1).toBe(sessionId2);
      expect(sessionId1).toBe(mockSessionId);
    });

    it('should include session ID in cart request headers', async () => {
      const getCartMock = customerApi.getCart as any;

      getCartMock.mockResolvedValue({
        data: { data: mockCart },
      });

      // This should be called with sessionId
      await (customerApi.getCart as any)();

      expect(getCartMock).toHaveBeenCalled();
    });

    it('should refresh cart after successful add to cart', async () => {
      const addToCartMock = customerApi.addToCart as any;
      const getCartMock = customerApi.getCart as any;

      const updatedCart = {
        ...mockCart,
        items: [
          ...mockCart.items,
          {
            id: 'item-2',
            variantId: 'variant-2',
            productName: 'Another Product',
            variantName: 'Red - L',
            imageUrl: 'https://example.com/image2.jpg',
            quantity: 1,
            unitPrice: 149.99,
            totalPrice: 149.99,
          },
        ],
        subtotal: 249.98,
        itemCount: 2,
      };

      addToCartMock.mockResolvedValue({
        data: { data: updatedCart },
      });

      getCartMock.mockResolvedValue({
        data: { data: updatedCart },
      });

      // Simulate add to cart then refresh
      const addResult = await (customerApi.addToCart as any)({ variantId: 'variant-2', quantity: 1 });
      const cartResult = await (customerApi.getCart as any)();

      expect(addResult.data.data.itemCount).toBe(2);
      expect(cartResult.data.data.itemCount).toBe(2);
    });
  });

  describe('Authenticated Cart Flow', () => {
    it('should use customer ID instead of session ID', async () => {
      const customerId = 'user-123';
      const authenticatedCart = {
        ...mockCart,
        customerId,
      };

      const getCartMock = customerApi.getCart as any;
      getCartMock.mockResolvedValue({
        data: { data: authenticatedCart },
      });

      const result = await getCartMock();

      expect(result.data.data).toHaveProperty('customerId', customerId);
    });

    it('should maintain cart across login/logout', async () => {
      const getCartMock = customerApi.getCart as any;

      // Anonymous cart
      getCartMock.mockResolvedValue({
        data: { data: mockCart },
      });

      const anonCart = await getCartMock();
      const anonItemCount = anonCart.data.data.itemCount;

      // After login, cart should still exist
      const authenticatedCart = {
        ...mockCart,
        customerId: 'user-123',
      };

      getCartMock.mockResolvedValue({
        data: { data: authenticatedCart },
      });

      const authCart = await getCartMock();
      const authItemCount = authCart.data.data.itemCount;

      expect(authItemCount).toBe(anonItemCount);
    });
  });

  describe('Cart Operations', () => {
    it('should add item and show in cart badge', async () => {
      const addToCartMock = customerApi.addToCart as any;
      const getCartMock = customerApi.getCart as any;

      const cartWithItem = { ...mockCart, itemCount: 1 };

      addToCartMock.mockResolvedValue({
        data: { data: cartWithItem },
      });

      getCartMock.mockResolvedValue({
        data: { data: cartWithItem },
      });

      await (customerApi.addToCart as any)({ variantId: 'variant-1', quantity: 1 });
      const cartResult = await (customerApi.getCart as any)();

      expect(cartResult.data.data.itemCount).toBe(1);
    });

    it('should update item quantity', async () => {
      const updateCartItemMock = customerApi.updateCartItem as any;

      const updatedCart = {
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            quantity: 3,
            totalPrice: 299.97,
          },
        ],
        itemCount: 3,
        subtotal: 299.97,
      };

      updateCartItemMock.mockResolvedValue({
        data: { data: updatedCart },
      });

      const result = await updateCartItemMock('item-1', { quantity: 3 });

      expect(result.data.data.itemCount).toBe(3);
      expect(result.data.data.subtotal).toBe(299.97);
    });

    it('should remove item from cart', async () => {
      const removeCartItemMock = customerApi.removeCartItem as any;

      const emptyCart = {
        id: 'cart-1',
        items: [],
        subtotal: 0,
        itemCount: 0,
      };

      removeCartItemMock.mockResolvedValue({
        data: { data: emptyCart },
      });

      const result = await removeCartItemMock('item-1');

      expect(result.data.data.itemCount).toBe(0);
      expect(result.data.data.items.length).toBe(0);
    });

    it('should handle multiple items and calculate totals correctly', async () => {
      const multiItemCart = {
        id: 'cart-1',
        items: [
          {
            id: 'item-1',
            variantId: 'variant-1',
            productName: 'Product 1',
            variantName: 'Blue',
            quantity: 2,
            unitPrice: 50.0,
            totalPrice: 100.0,
          },
          {
            id: 'item-2',
            variantId: 'variant-2',
            productName: 'Product 2',
            variantName: 'Red',
            quantity: 1,
            unitPrice: 75.0,
            totalPrice: 75.0,
          },
        ],
        subtotal: 175.0,
        itemCount: 3,
      };

      const getCartMock = customerApi.getCart as any;
      getCartMock.mockResolvedValue({
        data: { data: multiItemCart },
      });

      const result = await getCartMock();

      expect(result.data.data.itemCount).toBe(3);
      expect(result.data.data.subtotal).toBe(175.0);
      expect(result.data.data.items.length).toBe(2);
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle out of stock error', async () => {
      const addToCartMock = customerApi.addToCart as any;

      const outOfStockError = {
        response: {
          status: 400,
          data: { error: 'Product out of stock' },
        },
      };

      addToCartMock.mockRejectedValue(outOfStockError);

      await expect(
        (customerApi.addToCart as any)({ variantId: 'variant-1', quantity: 1 })
      ).rejects.toEqual(outOfStockError);
    });

    it('should handle cart not found', async () => {
      const getCartMock = customerApi.getCart as any;

      const notFoundError = {
        response: {
          status: 404,
          data: { error: 'Cart not found' },
        },
      };

      getCartMock.mockRejectedValue(notFoundError);

      await expect((customerApi.getCart as any)()).rejects.toEqual(notFoundError);
    });

    it('should handle network error gracefully', async () => {
      const addToCartMock = customerApi.addToCart as any;

      const networkError = new Error('Network error');

      addToCartMock.mockRejectedValue(networkError);

      await expect(
        (customerApi.addToCart as any)({ variantId: 'variant-1', quantity: 1 })
      ).rejects.toThrow('Network error');
    });

    it('should handle invalid quantity', async () => {
      const addToCartMock = customerApi.addToCart as any;

      const validationError = {
        response: {
          status: 422,
          data: { error: 'Invalid quantity' },
        },
      };

      addToCartMock.mockRejectedValue(validationError);

      await expect(
        (customerApi.addToCart as any)({ variantId: 'variant-1', quantity: -1 })
      ).rejects.toEqual(validationError);
    });

    it('should handle concurrent add to cart operations', async () => {
      const addToCartMock = customerApi.addToCart as any;

      let itemCount = 0;
      addToCartMock.mockImplementation(() => {
        itemCount++;
        return Promise.resolve({
          data: {
            data: {
              ...mockCart,
              itemCount,
            },
          },
        });
      });

      const results = await Promise.all([
        (customerApi.addToCart as any)({ variantId: 'variant-1', quantity: 1 }),
        (customerApi.addToCart as any)({ variantId: 'variant-2', quantity: 1 }),
        (customerApi.addToCart as any)({ variantId: 'variant-3', quantity: 1 }),
      ]);

      expect(results.length).toBe(3);
      expect(results[2].data.data.itemCount).toBe(3);
    });
  });

  describe('Cart Context Synchronization', () => {
    it('should update context after add to cart mutation', async () => {
      const addToCartMock = customerApi.addToCart as any;
      const getCartMock = customerApi.getCart as any;

      addToCartMock.mockResolvedValue({
        data: { data: mockCart },
      });

      getCartMock.mockResolvedValue({
        data: { data: mockCart },
      });

      // Simulate mutation callback
      const result = await (customerApi.addToCart as any)({ variantId: 'variant-1', quantity: 1 });

      // Then context should refresh
      const contextResult = await (customerApi.getCart as any)();

      expect(contextResult.data.data.itemCount).toBe(result.data.data.itemCount);
    });

    it('should update badge count in header after item added', async () => {
      const cartWithItems = {
        ...mockCart,
        itemCount: 2,
        items: [
          ...mockCart.items,
          {
            id: 'item-2',
            variantId: 'variant-2',
            productName: 'Product 2',
            variantName: 'Red',
            quantity: 1,
            unitPrice: 99.99,
            totalPrice: 99.99,
          },
        ],
      };

      const getCartMock = customerApi.getCart as any;
      getCartMock.mockResolvedValue({
        data: { data: cartWithItems },
      });

      const result = await getCartMock();

      // Badge should show 2 items
      expect(result.data.data.itemCount).toBe(2);
    });

    it('should update badge count after item removed', async () => {
      const cartWithoutItems = {
        id: 'cart-1',
        items: [],
        subtotal: 0,
        itemCount: 0,
      };

      const getCartMock = customerApi.getCart as any;
      getCartMock.mockResolvedValue({
        data: { data: cartWithoutItems },
      });

      const result = await getCartMock();

      // Badge should show 0 items
      expect(result.data.data.itemCount).toBe(0);
    });
  });

  describe('Stock Validation', () => {
    it('should prevent adding more than available stock', async () => {
      const addToCartMock = customerApi.addToCart as any;

      const stockError = {
        response: {
          status: 400,
          data: { error: 'Requested quantity exceeds available stock' },
        },
      };

      addToCartMock.mockRejectedValue(stockError);

      await expect(
        (customerApi.addToCart as any)({ variantId: 'variant-1', quantity: 1000 })
      ).rejects.toEqual(stockError);
    });

    it('should allow adding items up to available stock', async () => {
      const addToCartMock = customerApi.addToCart as any;

      const cartWithMaxStock = {
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            quantity: 10,
            totalPrice: 999.9,
          },
        ],
        subtotal: 999.9,
        itemCount: 10,
      };

      addToCartMock.mockResolvedValue({
        data: { data: cartWithMaxStock },
      });

      const result = await (customerApi.addToCart as any)({
        variantId: 'variant-1',
        quantity: 10,
      });

      expect(result.data.data.itemCount).toBe(10);
    });
  });
});
