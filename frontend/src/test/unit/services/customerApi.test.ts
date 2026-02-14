import { describe, it, expect, beforeEach } from 'vitest';
import { customerApi, profileApi } from '../../../services/customerApi';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import type { Cart, Order, Address, FavoritesResponse } from '../../../types';

describe('customerApi', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Cart Operations', () => {
    it('should fetch customer cart', async () => {
      const mockCart: Cart = {
        id: 'cart-1',
        sessionId: 'session-123',
        items: [
          {
            id: 'item-1',
            variantId: 'var-1',
            productName: 'Test Product',
            variantName: 'Size L - Red',
            imageUrl: 'https://example.com/image.jpg',
            quantity: 2,
            unitPrice: 50,
            totalPrice: 100,
          },
        ],
        subtotal: 100,
        itemCount: 2,
      };

      server.use(
        http.get('http://localhost:3000/api/cart', () => {
          return HttpResponse.json({
            success: true,
            data: mockCart,
          });
        })
      );

      const result = await customerApi.getCart();

      expect(result.data.data.id).toBe('cart-1');
      expect(result.data.data.items).toHaveLength(1);
      expect(result.data.data.itemCount).toBe(2);
    });

    it('should add item to cart', async () => {
      const addToCartData = {
        variantId: 'var-1',
        quantity: 3,
      };

      const mockCart: Cart = {
        id: 'cart-1',
        items: [
          {
            id: 'item-1',
            variantId: 'var-1',
            productName: 'Test Product',
            variantName: 'Size L',
            quantity: 3,
            unitPrice: 50,
            totalPrice: 150,
          },
        ],
        subtotal: 150,
        itemCount: 3,
      };

      server.use(
        http.post('http://localhost:3000/api/cart/items', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(addToCartData);
          return HttpResponse.json({
            success: true,
            data: mockCart,
          });
        })
      );

      const result = await customerApi.addToCart(addToCartData);

      expect(result.data.data.itemCount).toBe(3);
      expect(result.data.data.subtotal).toBe(150);
    });

    it('should update cart item quantity', async () => {
      const updateData = {
        quantity: 5,
      };

      const mockCart: Cart = {
        id: 'cart-1',
        items: [
          {
            id: 'item-1',
            variantId: 'var-1',
            productName: 'Test Product',
            variantName: 'Size L',
            quantity: 5,
            unitPrice: 50,
            totalPrice: 250,
          },
        ],
        subtotal: 250,
        itemCount: 5,
      };

      server.use(
        http.patch('http://localhost:3000/api/cart/items/item-1', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(updateData);
          return HttpResponse.json({
            success: true,
            data: mockCart,
          });
        })
      );

      const result = await customerApi.updateCartItem('item-1', updateData);

      expect(result.data.data.items[0].quantity).toBe(5);
      expect(result.data.data.subtotal).toBe(250);
    });

    it('should remove item from cart', async () => {
      const mockCart: Cart = {
        id: 'cart-1',
        items: [],
        subtotal: 0,
        itemCount: 0,
      };

      server.use(
        http.delete('http://localhost:3000/api/cart/items/item-1', () => {
          return HttpResponse.json({
            success: true,
            data: mockCart,
          });
        })
      );

      const result = await customerApi.removeCartItem('item-1');

      expect(result.data.data.items).toHaveLength(0);
      expect(result.data.data.itemCount).toBe(0);
    });

    it('should clear entire cart', async () => {
      const mockCart: Cart = {
        id: 'cart-1',
        items: [],
        subtotal: 0,
        itemCount: 0,
      };

      server.use(
        http.delete('http://localhost:3000/api/cart', () => {
          return HttpResponse.json({
            success: true,
            data: mockCart,
          });
        })
      );

      const result = await customerApi.clearCart();

      expect(result.data.data.items).toHaveLength(0);
    });
  });

  describe('Orders', () => {
    it('should fetch customer orders', async () => {
      const mockOrdersResponse = {
        orders: [
          {
            id: 'order-1',
            orderNumber: 'ORD-001',
            status: 'DELIVERED',
            total: 150,
            subtotal: 140,
            discount: 0,
            deliveryFee: 10,
            deliveryType: 'HOME_DELIVERY',
            paymentMethod: 'CASH_ON_DELIVERY',
            paymentStatus: 'PAID',
            customerId: 'cust-1',
            shippingAddress: {
              id: 'addr-1',
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA',
              isDefault: true,
            },
            items: [],
            createdAt: '2024-01-01T00:00:00Z',
          } as Order,
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      server.use(
        http.get('http://localhost:3000/api/orders', () => {
          return HttpResponse.json({
            success: true,
            data: mockOrdersResponse,
          });
        })
      );

      const result = await customerApi.getOrders();

      expect(result.data.data.orders).toHaveLength(1);
      expect(result.data.data.orders[0].orderNumber).toBe('ORD-001');
      expect(result.data.data.pagination.total).toBe(1);
    });

    it('should fetch order by id', async () => {
      const mockOrder: Order = {
        id: 'order-1',
        orderNumber: 'ORD-001',
        status: 'CONFIRMED',
        total: 200,
        subtotal: 180,
        discount: 0,
        deliveryFee: 5,
        deliveryType: 'HOME_DELIVERY',
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PENDING',
        customerId: 'cust-1',
        shippingAddress: {
          id: 'addr-1',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          isDefault: true,
        },
        items: [
          {
            id: 'item-1',
            productName: 'Test Product',
            variantName: 'Size L',
            quantity: 2,
            unitPrice: 90,
            totalPrice: 180,
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        customerNotes: 'Please deliver in the evening',
      };

      server.use(
        http.get('http://localhost:3000/api/orders/order-1', () => {
          return HttpResponse.json({
            success: true,
            data: mockOrder,
          });
        })
      );

      const result = await customerApi.getOrderById('order-1');

      expect(result.data.data.id).toBe('order-1');
      expect(result.data.data.items).toHaveLength(1);
    });

    it('should create a new order', async () => {
      const orderData = {
        addressId: 'addr-1',
        deliveryType: 'HOME_DELIVERY' as const,
        paymentMethod: 'CASH_ON_DELIVERY' as const,
        customerNotes: 'Ring the bell twice',
      };

      const mockOrder: Order = {
        id: 'order-new',
        orderNumber: 'ORD-002',
        status: 'PENDING',
        total: 150,
        subtotal: 140,
        discount: 0,
        deliveryFee: 10,
        deliveryType: 'HOME_DELIVERY',
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PENDING',
        customerId: 'cust-1',
        shippingAddress: {
          id: 'addr-1',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          isDefault: true,
        },
        items: [],
        createdAt: '2024-01-02T00:00:00Z',
        customerNotes: 'Ring the bell twice',
      };

      server.use(
        http.post('http://localhost:3000/api/orders', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(orderData);
          return HttpResponse.json({
            success: true,
            data: mockOrder,
          });
        })
      );

      const result = await customerApi.createOrder(orderData);

      expect(result.data.data.status).toBe('PENDING');
      expect(result.data.data.orderNumber).toBe('ORD-002');
    });
  });

  describe('Addresses', () => {
    it('should fetch customer addresses', async () => {
      const mockAddresses: Address[] = [
        {
          id: 'addr-1',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          isDefault: true,
        },
        {
          id: 'addr-2',
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA',
          isDefault: false,
        },
      ];

      server.use(
        http.get('http://localhost:3000/api/addresses', () => {
          return HttpResponse.json({
            success: true,
            data: mockAddresses,
          });
        })
      );

      const result = await customerApi.getAddresses();

      expect(result.data.data).toHaveLength(2);
      expect(result.data.data[0].isDefault).toBe(true);
    });

    it('should create new address', async () => {
      const addressData = {
        street: '789 Pine Rd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60007',
        country: 'USA',
        isDefault: false,
      };

      const mockAddress: Address = {
        id: 'addr-3',
        ...addressData,
      };

      server.use(
        http.post('http://localhost:3000/api/addresses', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(addressData);
          return HttpResponse.json({
            success: true,
            data: mockAddress,
          });
        })
      );

      const result = await customerApi.createAddress(addressData);

      expect(result.data.data.id).toBe('addr-3');
      expect(result.data.data.city).toBe('Chicago');
    });

    it('should update address', async () => {
      const updateData = {
        street: '789 Pine Road Updated',
        isDefault: true,
      };

      const mockAddress: Address = {
        id: 'addr-3',
        street: '789 Pine Road Updated',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60007',
        country: 'USA',
        isDefault: true,
      };

      server.use(
        http.patch('http://localhost:3000/api/addresses/addr-3', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(updateData);
          return HttpResponse.json({
            success: true,
            data: mockAddress,
          });
        })
      );

      const result = await customerApi.updateAddress('addr-3', updateData);

      expect(result.data.data.isDefault).toBe(true);
      expect(result.data.data.street).toBe('789 Pine Road Updated');
    });

    it('should delete address', async () => {
      server.use(
        http.delete('http://localhost:3000/api/addresses/addr-3', () => {
          return HttpResponse.json({
            success: true,
            data: { message: 'Address deleted' },
          });
        })
      );

      const result = await customerApi.deleteAddress('addr-3');

      expect(result.data.success).toBe(true);
    });
  });

  describe('Favorites', () => {
    it('should fetch customer favorites', async () => {
      const mockFavorites: FavoritesResponse = {
        items: [
          {
            id: 'fav-1',
            productId: 'prod-1',
            sku: 'PROD-001',
            name: 'Favorite Product',
            slug: 'favorite-product',
            brand: 'Brand Name',
            basePrice: 100,
            discountPercent: 10,
            finalPrice: 90,
            imageUrl: 'https://example.com/product.jpg',
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get('http://localhost:3000/api/favorites', () => {
          return HttpResponse.json({
            success: true,
            data: mockFavorites,
          });
        })
      );

      const result = await customerApi.getFavorites();

      expect(result.data.data.items).toHaveLength(1);
      expect(result.data.data.total).toBe(1);
    });

    it('should add product to favorites', async () => {
      const mockFavorites: FavoritesResponse = {
        items: [
          {
            id: 'fav-1',
            productId: 'prod-1',
            sku: 'PROD-001',
            name: 'Added Product',
            slug: 'added-product',
            brand: null,
            basePrice: 50,
            discountPercent: 0,
            finalPrice: 50,
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.post('http://localhost:3000/api/favorites', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({ productId: 'prod-1' });
          return HttpResponse.json({
            success: true,
            data: mockFavorites,
          });
        })
      );

      const result = await customerApi.addToFavorites('prod-1');

      expect(result.data.data.total).toBe(1);
    });

    it('should remove product from favorites', async () => {
      const mockFavorites: FavoritesResponse = {
        items: [],
        total: 0,
      };

      server.use(
        http.delete('http://localhost:3000/api/favorites/prod-1', () => {
          return HttpResponse.json({
            success: true,
            data: mockFavorites,
          });
        })
      );

      const result = await customerApi.removeFromFavorites('prod-1');

      expect(result.data.data.total).toBe(0);
    });

    it('should fetch favorite product IDs', async () => {
      server.use(
        http.get('http://localhost:3000/api/favorites/product-ids', () => {
          return HttpResponse.json({
            success: true,
            data: {
              productIds: ['prod-1', 'prod-2', 'prod-3'],
            },
          });
        })
      );

      const result = await customerApi.getFavoriteProductIds();

      expect(result.data.data.productIds).toHaveLength(3);
      expect(result.data.data.productIds).toContain('prod-1');
    });

    it('should check if product is favorite', async () => {
      server.use(
        http.get('http://localhost:3000/api/favorites/check/prod-1', () => {
          return HttpResponse.json({
            success: true,
            data: {
              isFavorite: true,
            },
          });
        })
      );

      const result = await customerApi.checkIsFavorite('prod-1');

      expect(result.data.data.isFavorite).toBe(true);
    });

    it('should return false for non-favorite product', async () => {
      server.use(
        http.get('http://localhost:3000/api/favorites/check/prod-99', () => {
          return HttpResponse.json({
            success: true,
            data: {
              isFavorite: false,
            },
          });
        })
      );

      const result = await customerApi.checkIsFavorite('prod-99');

      expect(result.data.data.isFavorite).toBe(false);
    });
  });

  describe('Profile', () => {
    it('should fetch customer profile', async () => {
      server.use(
        http.get('http://localhost:3000/api/customer/profile', () => {
          return HttpResponse.json({
            success: true,
            data: {
              id: 'cust-1',
              email: 'customer@example.com',
              firstName: 'John',
              lastName: 'Doe',
              phone: '1234567890',
              createdAt: '2024-01-01T00:00:00Z',
            },
          });
        })
      );

      const result = await customerApi.getProfile();

      expect(result.data.data.email).toBe('customer@example.com');
      expect(result.data.data.firstName).toBe('John');
    });

    it('should update customer profile', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '0987654321',
      };

      server.use(
        http.put('http://localhost:3000/api/customer/profile', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(updateData);
          return HttpResponse.json({
            success: true,
            data: {
              id: 'cust-1',
              ...updateData,
            },
          });
        })
      );

      const result = await customerApi.updateProfile(updateData);

      expect(result.data.data.firstName).toBe('Jane');
      expect(result.data.data.email).toBe('jane.smith@example.com');
    });

    it('should update customer password', async () => {
      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword456',
      };

      server.use(
        http.put('http://localhost:3000/api/customer/profile/password', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(passwordData);
          return HttpResponse.json({
            success: true,
            data: { message: 'Password updated successfully' },
          });
        })
      );

      const result = await customerApi.updatePassword(passwordData);

      expect(result.data.data.message).toBe('Password updated successfully');
    });
  });

  describe('Profile API export', () => {
    it('should export profileApi as an alias for customerApi', () => {
      expect(profileApi).toBe(customerApi);
      expect(profileApi.getProfile).toBe(customerApi.getProfile);
      expect(profileApi.updateProfile).toBe(customerApi.updateProfile);
    });
  });

  describe('Error Handling', () => {
    it('should handle cart not found', async () => {
      server.use(
        http.get('http://localhost:3000/api/cart', () => {
          return HttpResponse.json(
            { success: false, message: 'Cart not found' },
            { status: 404 }
          );
        })
      );

      await expect(customerApi.getCart()).rejects.toThrow();
    });

    it('should handle order creation validation error', async () => {
      server.use(
        http.post('http://localhost:3000/api/orders', () => {
          return HttpResponse.json(
            { success: false, message: 'Invalid address' },
            { status: 400 }
          );
        })
      );

      await expect(
        customerApi.createOrder({
          addressId: 'invalid',
          deliveryType: 'HOME_DELIVERY',
          paymentMethod: 'CASH_ON_DELIVERY',
        })
      ).rejects.toThrow();
    });

    it('should handle unauthorized access', async () => {
      server.use(
        http.get('http://localhost:3000/api/orders', () => {
          return HttpResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      await expect(customerApi.getOrders()).rejects.toThrow();
    });
  });
});
