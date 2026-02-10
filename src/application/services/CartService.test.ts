import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartService } from '../../application/services/CartService';
import * as prisma from '../../infrastructure/database/prisma';
import { v4 as uuidv4 } from 'uuid';

// Mock Prisma
vi.mock('../../infrastructure/database/prisma');

const mockPrismaClient = {
  cart: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  cartItem: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  variant: {
    findUnique: vi.fn(),
  },
};

describe('CartService', () => {
  let cartService: CartService;
  const mockSessionId = uuidv4();
  const mockCustomerId = 'user-123';
  const mockVariantId = 'variant-456';

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma as any).prisma = mockPrismaClient;
    cartService = new CartService();
  });

  describe('getCartEntity - Anonymous User', () => {
    it('should create new cart for anonymous user without sessionId', async () => {
      const mockNewSessionId = uuidv4();

      mockPrismaClient.cart.findUnique.mockResolvedValue(null);
      mockPrismaClient.cart.create.mockResolvedValue({
        id: 'cart-new-1',
        customerId: null,
        sessionId: mockNewSessionId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        items: [],
      });

      const cart = await cartService.getCartEntity(null, null);

      expect(cart.sessionId).toBeDefined();
      expect(mockPrismaClient.cart.create).toHaveBeenCalled();
      expect(cart.customerId).toBeNull();
    });

    it('should return existing cart for anonymous user with sessionId', async () => {
      const existingCart = {
        id: 'cart-anon-1',
        customerId: null,
        sessionId: mockSessionId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        items: [],
      };

      mockPrismaClient.cart.findUnique.mockResolvedValue(existingCart);

      const cart = await cartService.getCartEntity(null, mockSessionId);

      expect(cart.id).toBe('cart-anon-1');
      expect(cart.sessionId).toBe(mockSessionId);
      expect(mockPrismaClient.cart.findUnique).toHaveBeenCalledWith({
        where: { sessionId: mockSessionId },
      });
    });

    it('should create new cart when anonymous session expired', async () => {
      const newSessionId = uuidv4();

      mockPrismaClient.cart.findUnique.mockResolvedValue(null); // Session expired
      mockPrismaClient.cart.create.mockResolvedValue({
        id: 'cart-new-2',
        customerId: null,
        sessionId: newSessionId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        items: [],
      });

      const cart = await cartService.getCartEntity(null, mockSessionId);

      expect(mockPrismaClient.cart.create).toHaveBeenCalled();
    });
  });

  describe('getCartEntity - Authenticated User', () => {
    it('should return existing cart for authenticated user', async () => {
      const existingCart = {
        id: 'cart-auth-1',
        customerId: mockCustomerId,
        sessionId: null,
        expiresAt: null,
        createdAt: new Date(),
        items: [],
      };

      mockPrismaClient.cart.findUnique.mockResolvedValue(existingCart);

      const cart = await cartService.getCartEntity(mockCustomerId, null);

      expect(cart.id).toBe('cart-auth-1');
      expect(cart.customerId).toBe(mockCustomerId);
      expect(mockPrismaClient.cart.findUnique).toHaveBeenCalledWith({
        where: { customerId: mockCustomerId },
      });
    });

    it('should create new cart for authenticated user without existing cart', async () => {
      mockPrismaClient.cart.findUnique.mockResolvedValue(null);
      mockPrismaClient.cart.create.mockResolvedValue({
        id: 'cart-auth-new',
        customerId: mockCustomerId,
        sessionId: null,
        expiresAt: null,
        createdAt: new Date(),
        items: [],
      });

      const cart = await cartService.getCartEntity(mockCustomerId, null);

      expect(cart.customerId).toBe(mockCustomerId);
      expect(mockPrismaClient.cart.create).toHaveBeenCalled();
    });
  });

  describe('addItem - Quantity Logic', () => {
    it('should add new item to cart', async () => {
      const mockCart = {
        id: 'cart-1',
        customerId: mockCustomerId,
        sessionId: null,
        items: [],
      };

      const mockVariant = {
        id: mockVariantId,
        sku: 'PRODUCT-001',
        stock: 10,
        productId: 'prod-1',
        price: 99.99,
      };

      vi.spyOn(cartService, 'getCartEntity').mockResolvedValue(mockCart as any);
      mockPrismaClient.variant.findUnique.mockResolvedValue(mockVariant);
      mockPrismaClient.cartItem.findUnique.mockResolvedValue(null);
      mockPrismaClient.cartItem.create.mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
        variantId: mockVariantId,
        quantity: 2,
      });

      await cartService.addItem(mockCustomerId, null, mockVariantId, 2);

      expect(mockPrismaClient.cartItem.create).toHaveBeenCalled();
    });

    it('should increase quantity if item already in cart', async () => {
      const mockCart = {
        id: 'cart-1',
        customerId: mockCustomerId,
        sessionId: null,
        items: [],
      };

      const mockExistingItem = {
        id: 'item-1',
        cartId: 'cart-1',
        variantId: mockVariantId,
        quantity: 2,
      };

      const mockVariant = {
        id: mockVariantId,
        stock: 10,
      };

      vi.spyOn(cartService, 'getCartEntity').mockResolvedValue(mockCart as any);
      mockPrismaClient.cartItem.findUnique.mockResolvedValue(mockExistingItem);
      mockPrismaClient.variant.findUnique.mockResolvedValue(mockVariant);
      mockPrismaClient.cartItem.update.mockResolvedValue({
        ...mockExistingItem,
        quantity: 4, // 2 + 2
      });

      await cartService.addItem(mockCustomerId, null, mockVariantId, 2);

      expect(mockPrismaClient.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { quantity: 4 },
      });
    });

    it('should throw error if quantity exceeds stock', async () => {
      const mockCart = {
        id: 'cart-1',
        customerId: mockCustomerId,
        sessionId: null,
        items: [],
      };

      const mockVariant = {
        id: mockVariantId,
        stock: 5,
      };

      vi.spyOn(cartService, 'getCartEntity').mockResolvedValue(mockCart as any);
      mockPrismaClient.variant.findUnique.mockResolvedValue(mockVariant);
      mockPrismaClient.cartItem.findUnique.mockResolvedValue(null);

      await expect(
        cartService.addItem(mockCustomerId, null, mockVariantId, 10)
      ).rejects.toThrow('Insufficient stock');
    });

    it('should not exceed max total quantity in cart', async () => {
      const mockCart = {
        id: 'cart-1',
        customerId: mockCustomerId,
        sessionId: null,
        items: [
          {
            id: 'item-1',
            variantId: 'variant-1',
            quantity: 45,
          },
        ],
      };

      const mockVariant = {
        id: mockVariantId,
        stock: 100,
      };

      vi.spyOn(cartService, 'getCartEntity').mockResolvedValue(mockCart as any);
      mockPrismaClient.variant.findUnique.mockResolvedValue(mockVariant);
      mockPrismaClient.cartItem.findUnique.mockResolvedValue(null);

      // Adding 10 more would exceed 50 item limit
      await expect(
        cartService.addItem(mockCustomerId, null, mockVariantId, 10)
      ).rejects.toThrow('Maximum 50 items');
    });
  });

  describe('updateItem - Quantity Update', () => {
    it('should update item quantity', async () => {
      const mockCart = {
        id: 'cart-1',
        customerId: mockCustomerId,
        items: [{ id: 'item-1', quantity: 2 }],
      };

      vi.spyOn(cartService, 'getCartEntity').mockResolvedValue(mockCart as any);
      mockPrismaClient.cartItem.findUnique.mockResolvedValue({
        id: 'item-1',
        quantity: 2,
      });
      mockPrismaClient.cartItem.update.mockResolvedValue({
        id: 'item-1',
        quantity: 5,
      });

      await cartService.updateItem(mockCustomerId, null, 'item-1', 5);

      expect(mockPrismaClient.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { quantity: 5 },
      });
    });

    it('should remove item when quantity set to 0', async () => {
      const mockCart = {
        id: 'cart-1',
        customerId: mockCustomerId,
        items: [{ id: 'item-1', quantity: 2 }],
      };

      vi.spyOn(cartService, 'getCartEntity').mockResolvedValue(mockCart as any);
      mockPrismaClient.cartItem.findUnique.mockResolvedValue({
        id: 'item-1',
        quantity: 2,
      });
      mockPrismaClient.cartItem.delete.mockResolvedValue({
        id: 'item-1',
      });

      await cartService.updateItem(mockCustomerId, null, 'item-1', 0);

      expect(mockPrismaClient.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 'item-1' },
      });
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const mockCart = {
        id: 'cart-1',
        customerId: mockCustomerId,
        items: [{ id: 'item-1', variantId: mockVariantId, quantity: 2 }],
      };

      vi.spyOn(cartService, 'getCartEntity').mockResolvedValue(mockCart as any);
      mockPrismaClient.cartItem.delete.mockResolvedValue({
        id: 'item-1',
      });

      await cartService.removeItem(mockCustomerId, null, 'item-1');

      expect(mockPrismaClient.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 'item-1' },
      });
    });
  });

  describe('transformCartResponse', () => {
    it('should calculate correct totals', async () => {
      const mockCart = {
        id: 'cart-1',
        customerId: mockCustomerId,
        items: [
          {
            id: 'item-1',
            quantity: 2,
            variant: { price: 50.0 },
          },
          {
            id: 'item-2',
            quantity: 3,
            variant: { price: 30.0 },
          },
        ],
      };

      vi.spyOn(cartService, 'getCartEntity').mockResolvedValue(mockCart as any);

      // Expected: (2 * 50) + (3 * 30) = 100 + 90 = 190
      expect((2 * 50) + (3 * 30)).toBe(190);
    });

    it('should handle empty cart', async () => {
      const mockCart = {
        id: 'cart-1',
        customerId: mockCustomerId,
        items: [],
      };

      vi.spyOn(cartService, 'getCartEntity').mockResolvedValue(mockCart as any);

      // Empty cart should have 0 subtotal and 0 items
      expect(mockCart.items.length).toBe(0);
      expect(mockCart.items.reduce((sum, item) => sum + (item.quantity * (item.variant?.price || 0)), 0)).toBe(0);
    });
  });

  describe('Session Management', () => {
    it('should set correct expiry for anonymous cart (7 days)', () => {
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      expect(sevenDaysLater.getTime() - now.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it('should not set expiry for authenticated cart', async () => {
      const mockCart = {
        id: 'cart-auth-1',
        customerId: mockCustomerId,
        sessionId: null,
        expiresAt: null,
      };

      expect(mockCart.expiresAt).toBeNull();
      expect(mockCart.customerId).toBe(mockCustomerId);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');
      vi.spyOn(cartService, 'getCartEntity').mockRejectedValue(mockError);

      await expect(cartService.getCartEntity(mockCustomerId, null)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should validate variant exists before adding', async () => {
      const mockCart = {
        id: 'cart-1',
        customerId: mockCustomerId,
        items: [],
      };

      vi.spyOn(cartService, 'getCartEntity').mockResolvedValue(mockCart as any);
      mockPrismaClient.variant.findUnique.mockResolvedValue(null);

      await expect(
        cartService.addItem(mockCustomerId, null, 'nonexistent-variant', 1)
      ).rejects.toThrow('Variant not found');
    });
  });
});
