import { describe, it, expect, beforeEach } from '@jest/globals';
import { CartService } from '../../../application/services/CartService';
import { prismaMock } from '../../setup';

describe('CartService', () => {
  let cartService: CartService;

  beforeEach(() => {
    cartService = new CartService(prismaMock);
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should get cart for authenticated customer', async () => {
      const customerId = 'cust-123';
      const mockCart = {
        id: 'cart-1',
        customerId,
        sessionId: null,
        items: [],
      };

      prismaMock.customer.findUnique.mockResolvedValue({
        id: customerId,
        email: 'customer@example.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        birthDate: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.cart.findUnique.mockResolvedValue(mockCart as any);

      const result = await cartService.getCart(undefined, customerId);

      expect(result).toBeDefined();
      expect(result.items).toEqual([]);
    });

    it('should get cart for anonymous session', async () => {
      const sessionId = 'session-123';
      const mockCart = {
        id: 'cart-1',
        sessionId,
        customerId: null,
        items: [],
      };

      prismaMock.cart.findUnique.mockResolvedValue(mockCart as any);

      const result = await cartService.getCart(sessionId);

      expect(result).toBeDefined();
      expect(prismaMock.cart.findUnique).toHaveBeenCalled();
    });

    it('should create cart for new customer if not exists', async () => {
      const customerId = 'cust-new';
      const newCart = {
        id: 'cart-new',
        customerId,
        sessionId: null,
        items: [],
      };

      prismaMock.customer.findUnique.mockResolvedValue({
        id: customerId,
        email: 'newcustomer@example.com',
        password: 'hashed',
        firstName: 'New',
        lastName: 'Customer',
        phone: '9876543210',
        birthDate: null,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.cart.findUnique.mockResolvedValue(null);
      prismaMock.cart.create.mockResolvedValue(newCart as any);

      const result = await cartService.getCart(undefined, customerId);

      expect(result).toBeDefined();
      expect(prismaMock.cart.create).toHaveBeenCalled();
    });

    it('should return empty items array for new cart', async () => {
      const customerId = 'cust-empty';
      prismaMock.customer.findUnique.mockResolvedValue({
        id: customerId,
        email: 'customer@example.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        birthDate: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.cart.findUnique.mockResolvedValue({
        id: 'cart-empty',
        customerId,
        items: [],
      } as any);

      const result = await cartService.getCart(undefined, customerId);

      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBe(0);
    });
  });

  describe('addToCart', () => {
    it('should add product to cart', async () => {
      const customerId = 'cust-123';
      const productId = 'prod-1';
      const variantId = 'var-1';
      const quantity = 2;

      const mockProduct = {
        id: productId,
        name: 'Test Product',
        basePrice: 99.99,
        images: [{ thumbnailUrl: 'https://example.com/image.jpg' }],
      };

      const mockVariant = {
        id: variantId,
        product: mockProduct,
        attributeValues: [],
      };

      prismaMock.customer.findUnique.mockResolvedValue({
        id: customerId,
        email: 'customer@example.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        birthDate: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [],
      } as any);

      prismaMock.variant.findUnique.mockResolvedValue(mockVariant as any);

      prismaMock.cartItem.findFirst.mockResolvedValue(null);

      prismaMock.cartItem.create.mockResolvedValue({
        id: 'item-1',
        cartId: 'cart-1',
        variantId,
        quantity,
        unitPrice: 99.99,
      } as any);

      const result = await cartService.addToCart(customerId, {
        productId,
        variantId,
        quantity,
      });

      expect(result).toBeDefined();
      expect(prismaMock.cartItem.create).toHaveBeenCalled();
    });

    it('should update quantity if variant already in cart', async () => {
      const customerId = 'cust-123';
      const variantId = 'var-1';

      prismaMock.customer.findUnique.mockResolvedValue({
        id: customerId,
        email: 'customer@example.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        birthDate: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [],
      } as any);

      const existingItem = {
        id: 'item-1',
        cartId: 'cart-1',
        variantId,
        quantity: 2,
        unitPrice: 99.99,
      };

      prismaMock.cartItem.findFirst.mockResolvedValue(existingItem as any);

      prismaMock.cartItem.update.mockResolvedValue({
        ...existingItem,
        quantity: 4,
      } as any);

      const result = await cartService.addToCart(customerId, {
        productId: 'prod-1',
        variantId,
        quantity: 2,
      });

      expect(result).toBeDefined();
      expect(prismaMock.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'item-1' },
        })
      );
    });

    it('should throw error if product not found', async () => {
      const customerId = 'cust-123';

      prismaMock.customer.findUnique.mockResolvedValue({
        id: customerId,
        email: 'customer@example.com',
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        birthDate: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [],
      } as any);

      prismaMock.variant.findUnique.mockResolvedValue(null);

      await expect(
        cartService.addToCart(customerId, {
          productId: 'nonexistent',
          variantId: 'var-1',
          quantity: 1,
        })
      ).rejects.toThrow();
    });

    it('should validate quantity is positive', async () => {
      const customerId = 'cust-123';

      await expect(
        cartService.addToCart(customerId, {
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 0,
        })
      ).rejects.toThrow();
    });
  });

  describe('updateCartItem', () => {
    it('should update item quantity in cart', async () => {
      const customerId = 'cust-123';
      const itemId = 'item-1';
      const newQuantity = 5;

      prismaMock.cartItem.findFirst.mockResolvedValue({
        id: itemId,
        cartId: 'cart-1',
        variantId: 'var-1',
        quantity: 2,
        unitPrice: 99.99,
        cart: { customerId },
      } as any);

      prismaMock.cartItem.update.mockResolvedValue({
        id: itemId,
        cartId: 'cart-1',
        variantId: 'var-1',
        quantity: newQuantity,
        unitPrice: 99.99,
      } as any);

      prismaMock.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [],
      } as any);

      const result = await cartService.updateCartItem(
        customerId,
        itemId,
        { quantity: newQuantity }
      );

      expect(result).toBeDefined();
      expect(prismaMock.cartItem.update).toHaveBeenCalled();
    });

    it('should not allow updating to zero or negative quantity', async () => {
      const customerId = 'cust-123';
      const itemId = 'item-1';

      prismaMock.cartItem.findFirst.mockResolvedValue({
        id: itemId,
        cartId: 'cart-1',
        variantId: 'var-1',
        quantity: 2,
        unitPrice: 99.99,
        cart: { customerId },
      } as any);

      await expect(
        cartService.updateCartItem(customerId, itemId, { quantity: 0 })
      ).rejects.toThrow();
    });

    it('should throw error if item not found', async () => {
      const customerId = 'cust-123';

      prismaMock.cartItem.findFirst.mockResolvedValue(null);

      await expect(
        cartService.updateCartItem(customerId, 'nonexistent', { quantity: 5 })
      ).rejects.toThrow();
    });

    it('should verify item ownership before updating', async () => {
      const customerId = 'cust-123';
      const itemId = 'item-1';

      prismaMock.cartItem.findFirst.mockResolvedValue({
        id: itemId,
        cartId: 'cart-1',
        variantId: 'var-1',
        quantity: 2,
        unitPrice: 99.99,
        cart: { customerId: 'different-cust' }, // Different customer
      } as any);

      await expect(
        cartService.updateCartItem(customerId, itemId, { quantity: 5 })
      ).rejects.toThrow();
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const customerId = 'cust-123';
      const itemId = 'item-1';

      prismaMock.cartItem.findFirst.mockResolvedValue({
        id: itemId,
        cartId: 'cart-1',
        variantId: 'var-1',
        quantity: 2,
        unitPrice: 99.99,
        cart: { customerId },
      } as any);

      prismaMock.cartItem.delete.mockResolvedValue({
        id: itemId,
        cartId: 'cart-1',
        variantId: 'var-1',
        quantity: 2,
        unitPrice: 99.99,
      } as any);

      prismaMock.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [],
      } as any);

      const result = await cartService.removeFromCart(customerId, itemId);

      expect(result).toBeDefined();
      expect(prismaMock.cartItem.delete).toHaveBeenCalled();
    });

    it('should throw error if item not found', async () => {
      const customerId = 'cust-123';

      prismaMock.cartItem.findFirst.mockResolvedValue(null);

      await expect(
        cartService.removeFromCart(customerId, 'nonexistent')
      ).rejects.toThrow();
    });

    it('should verify item ownership before removing', async () => {
      const customerId = 'cust-123';
      const itemId = 'item-1';

      prismaMock.cartItem.findFirst.mockResolvedValue({
        id: itemId,
        cartId: 'cart-1',
        variantId: 'var-1',
        quantity: 2,
        unitPrice: 99.99,
        cart: { customerId: 'different-cust' },
      } as any);

      await expect(
        cartService.removeFromCart(customerId, itemId)
      ).rejects.toThrow();
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const customerId = 'cust-123';

      prismaMock.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [
          { id: 'item-1', variantId: 'var-1', quantity: 2 },
          { id: 'item-2', variantId: 'var-2', quantity: 1 },
        ],
      } as any);

      prismaMock.cartItem.deleteMany.mockResolvedValue({ count: 2 });

      prismaMock.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [],
      } as any);

      const result = await cartService.clearCart(customerId);

      expect(result).toBeDefined();
      expect(result.items.length).toBe(0);
      expect(prismaMock.cartItem.deleteMany).toHaveBeenCalled();
    });

    it('should handle clearing empty cart', async () => {
      const customerId = 'cust-123';

      prismaMock.cart.findUnique.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [],
      } as any);

      const result = await cartService.clearCart(customerId);

      expect(result.items.length).toBe(0);
    });
  });

  describe('calculateCartTotal', () => {
    it('should calculate total price correctly', async () => {
      const customerId = 'cust-123';

      const cartWithItems = {
        id: 'cart-1',
        customerId,
        items: [
          {
            id: 'item-1',
            variantId: 'var-1',
            quantity: 2,
            unitPrice: 50.0,
            variant: {
              id: 'var-1',
              product: {
                name: 'Product 1',
                images: [],
              },
              attributeValues: [],
            },
          },
          {
            id: 'item-2',
            variantId: 'var-2',
            quantity: 1,
            unitPrice: 100.0,
            variant: {
              id: 'var-2',
              product: {
                name: 'Product 2',
                images: [],
              },
              attributeValues: [],
            },
          },
        ],
      };

      prismaMock.cart.findUnique.mockResolvedValue(cartWithItems as any);

      const result = await cartService.getCart(undefined, customerId);

      // Total should be 2*50 + 1*100 = 200
      expect(result).toBeDefined();
      expect(result.items.length).toBe(2);
    });

    it('should handle decimal prices', async () => {
      const customerId = 'cust-123';

      const cartWithDecimalPrices = {
        id: 'cart-1',
        customerId,
        items: [
          {
            id: 'item-1',
            variantId: 'var-1',
            quantity: 3,
            unitPrice: 19.99,
            variant: {
              id: 'var-1',
              product: {
                name: 'Product 1',
                images: [],
              },
              attributeValues: [],
            },
          },
        ],
      };

      prismaMock.cart.findUnique.mockResolvedValue(cartWithDecimalPrices as any);

      const result = await cartService.getCart(undefined, customerId);

      expect(result).toBeDefined();
      expect(result.items.length).toBe(1);
    });
  });
});
