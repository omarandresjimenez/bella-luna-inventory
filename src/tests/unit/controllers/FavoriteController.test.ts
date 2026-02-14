import { describe, it, expect, beforeEach } from '@jest/globals';
import { FavoriteController } from '../../../interface/controllers/FavoriteController.js';
import { createMockRequest, createMockResponse } from '../../test-utils.js';
import { HttpStatus } from '../../../shared/utils/api-response.js';

describe('FavoriteController', () => {
  let controller: FavoriteController;
  let mockFavoriteService: any;

  beforeEach(() => {
    mockFavoriteService = {
      getFavorites: jest.fn(),
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      isFavorite: jest.fn(),
      getFavoritesCount: jest.fn(),
    };
    controller = new FavoriteController(mockFavoriteService);
    jest.clearAllMocks();
  });

  describe('getFavorites', () => {
    it('should return all favorites for authenticated user', async () => {
      const mockFavorites = {
        data: [
          {
            id: 'fav-1',
            productId: 'prod-1',
            product: {
              id: 'prod-1',
              name: 'Laptop',
              price: 999.99,
              image: 'laptop.jpg',
            },
            customerId: 'cust-1',
            createdAt: new Date(),
          },
          {
            id: 'fav-2',
            productId: 'prod-2',
            product: {
              id: 'prod-2',
              name: 'Mouse',
              price: 29.99,
              image: 'mouse.jpg',
            },
            customerId: 'cust-1',
            createdAt: new Date(),
          },
        ],
        pagination: { total: 2, page: 1, limit: 10 },
      };

      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
        query: { page: '1', limit: '10' },
      });
      const res = createMockResponse();
      mockFavoriteService.getFavorites.mockResolvedValue(mockFavorites);

      await controller.getFavorites(req, res);

      expect(mockFavoriteService.getFavorites).toHaveBeenCalledWith(
        'cust-1',
        expect.objectContaining({ page: 1, limit: 10 })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockFavorites,
        })
      );
    });

    it('should return 401 for unauthenticated users', async () => {
      const req = createMockRequest({
        user: undefined, // Not authenticated
      });
      const res = createMockResponse();

      await controller.getFavorites(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        })
      );
    });

    it('should return empty list when user has no favorites', async () => {
      const mockFavorites = {
        data: [],
        pagination: { total: 0, page: 1, limit: 10 },
      };

      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
        query: {},
      });
      const res = createMockResponse();
      mockFavoriteService.getFavorites.mockResolvedValue(mockFavorites);

      await controller.getFavorites(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ data: [] }),
        })
      );
    });

    it('should support pagination', async () => {
      const mockFavorites = {
        data: [],
        pagination: { total: 50, page: 3, limit: 10 },
      };

      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
        query: { page: '3', limit: '10' },
      });
      const res = createMockResponse();
      mockFavoriteService.getFavorites.mockResolvedValue(mockFavorites);

      await controller.getFavorites(req, res);

      expect(mockFavoriteService.getFavorites).toHaveBeenCalledWith(
        'cust-1',
        expect.objectContaining({ page: 3, limit: 10 })
      );
    });

    it('should handle service errors', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
      });
      const res = createMockResponse();
      mockFavoriteService.getFavorites.mockRejectedValue(new Error('Database error'));

      await controller.getFavorites(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return favorites with product details including images', async () => {
      const mockFavorites = {
        data: [
          {
            id: 'fav-1',
            productId: 'prod-1',
            product: {
              id: 'prod-1',
              name: 'Premium Laptop',
              description: 'High-end laptop',
              price: 1500.00,
              discountPercent: 10,
              images: [
                { url: 'https://example.com/image1.jpg', isPrimary: true },
                { url: 'https://example.com/image2.jpg', isPrimary: false },
              ],
              stock: 5,
              isActive: true,
            },
            customerId: 'cust-1',
            createdAt: new Date('2025-01-01'),
          },
        ],
      };

      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
      });
      const res = createMockResponse();
      mockFavoriteService.getFavorites.mockResolvedValue(mockFavorites);

      await controller.getFavorites(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                product: expect.objectContaining({
                  images: expect.any(Array),
                }),
              }),
            ]),
          }),
        })
      );
    });
  });

  describe('addFavorite', () => {
    it('should add product to favorites successfully', async () => {
      const mockFavorite = {
        id: 'fav-new',
        productId: 'prod-1',
        customerId: 'cust-1',
        product: {
          id: 'prod-1',
          name: 'Test Product',
          price: 99.99,
        },
        createdAt: new Date(),
      };

      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
        body: { productId: 'prod-1' },
      });
      const res = createMockResponse();
      mockFavoriteService.addFavorite.mockResolvedValue(mockFavorite);

      await controller.addFavorite(req, res);

      expect(mockFavoriteService.addFavorite).toHaveBeenCalledWith('cust-1', 'prod-1');
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockFavorite,
        })
      );
    });

    it('should return 401 for unauthenticated users', async () => {
      const req = createMockRequest({
        user: undefined,
        body: { productId: 'prod-1' },
      });
      const res = createMockResponse();

      await controller.addFavorite(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    });

    it('should validate product ID is provided', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
        body: {}, // Missing productId
      });
      const res = createMockResponse();

      await controller.addFavorite(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('product'),
        })
      );
    });

    it('should prevent duplicate favorites', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
        body: { productId: 'prod-1' },
      });
      const res = createMockResponse();
      mockFavoriteService.addFavorite.mockRejectedValue(
        new Error('Product already in favorites')
      );

      await controller.addFavorite(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('already in favorites'),
        })
      );
    });

    it('should validate product exists', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
        body: { productId: 'nonexistent' },
      });
      const res = createMockResponse();
      mockFavoriteService.addFavorite.mockRejectedValue(
        new Error('Product not found')
      );

      await controller.addFavorite(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should handle service errors', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
        body: { productId: 'prod-1' },
      });
      const res = createMockResponse();
      mockFavoriteService.addFavorite.mockRejectedValue(new Error('Database error'));

      await controller.addFavorite(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('removeFavorite', () => {
    it('should remove product from favorites successfully', async () => {
      const mockRemovedFavorite = {
        id: 'fav-1',
        productId: 'prod-1',
        customerId: 'cust-1',
      };

      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
        params: { productId: 'prod-1' },
      });
      const res = createMockResponse();
      mockFavoriteService.removeFavorite.mockResolvedValue(mockRemovedFavorite);

      await controller.removeFavorite(req, res);

      expect(mockFavoriteService.removeFavorite).toHaveBeenCalledWith('cust-1', 'prod-1');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockRemovedFavorite,
        })
      );
    });

    it('should return 401 for unauthenticated users', async () => {
      const req = createMockRequest({
        user: undefined,
        params: { productId: 'prod-1' },
      });
      const res = createMockResponse();

      await controller.removeFavorite(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    });

    it('should return 404 when favorite not found', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
        params: { productId: 'nonexistent' },
      });
      const res = createMockResponse();
      mockFavoriteService.removeFavorite.mockRejectedValue(
        new Error('Favorite not found')
      );

      await controller.removeFavorite(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('should verify customer owns the favorite before removal', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
        params: { productId: 'prod-1' },
      });
      const res = createMockResponse();
      mockFavoriteService.removeFavorite.mockRejectedValue(
        new Error('Unauthorized: This favorite does not belong to you')
      );

      await controller.removeFavorite(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Unauthorized'),
        })
      );
    });

    it('should handle service errors', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
        params: { productId: 'prod-1' },
      });
      const res = createMockResponse();
      mockFavoriteService.removeFavorite.mockRejectedValue(new Error('Database error'));

      await controller.removeFavorite(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('isFavorite', () => {
    it('should check if product is favorited', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
        params: { productId: 'prod-1' },
      });
      const res = createMockResponse();
      mockFavoriteService.isFavorite.mockResolvedValue(true);

      await controller.isFavorite(req, res);

      expect(mockFavoriteService.isFavorite).toHaveBeenCalledWith('cust-1', 'prod-1');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { isFavorite: true },
        })
      );
    });

    it('should return false when product is not favorited', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
        params: { productId: 'prod-1' },
      });
      const res = createMockResponse();
      mockFavoriteService.isFavorite.mockResolvedValue(false);

      await controller.isFavorite(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { isFavorite: false },
        })
      );
    });

    it('should return 401 for unauthenticated users', async () => {
      const req = createMockRequest({
        user: undefined,
        params: { productId: 'prod-1' },
      });
      const res = createMockResponse();

      await controller.isFavorite(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    });

    it('should handle service errors', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
        params: { productId: 'prod-1' },
      });
      const res = createMockResponse();
      mockFavoriteService.isFavorite.mockRejectedValue(new Error('Database error'));

      await controller.isFavorite(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('getFavoritesCount', () => {
    it('should return count of customer favorites', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
      });
      const res = createMockResponse();
      mockFavoriteService.getFavoritesCount.mockResolvedValue(5);

      await controller.getFavoritesCount(req, res);

      expect(mockFavoriteService.getFavoritesCount).toHaveBeenCalledWith('cust-1');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { count: 5 },
        })
      );
    });

    it('should return 0 when user has no favorites', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
      });
      const res = createMockResponse();
      mockFavoriteService.getFavoritesCount.mockResolvedValue(0);

      await controller.getFavoritesCount(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { count: 0 },
        })
      );
    });

    it('should return 401 for unauthenticated users', async () => {
      const req = createMockRequest({
        user: undefined,
      });
      const res = createMockResponse();

      await controller.getFavoritesCount(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    });

    it('should handle service errors', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
      });
      const res = createMockResponse();
      mockFavoriteService.getFavoritesCount.mockRejectedValue(new Error('Database error'));

      await controller.getFavoritesCount(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should handle large favorite counts', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-1', role: 'CUSTOMER' },
      });
      const res = createMockResponse();
      mockFavoriteService.getFavoritesCount.mockResolvedValue(999);

      await controller.getFavoritesCount(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { count: 999 },
        })
      );
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete favorite workflow', async () => {
      const customerId = 'cust-1';

      // Add favorite
      let req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
        body: { productId: 'prod-1' },
      });
      let res = createMockResponse();
      mockFavoriteService.addFavorite.mockResolvedValue({
        id: 'fav-1',
        productId: 'prod-1',
        customerId,
      });

      await controller.addFavorite(req, res);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);

      // Check if favorited
      jest.clearAllMocks();
      req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
        params: { productId: 'prod-1' },
      });
      res = createMockResponse();
      mockFavoriteService.isFavorite.mockResolvedValue(true);

      await controller.isFavorite(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { isFavorite: true },
        })
      );

      // Get count
      jest.clearAllMocks();
      req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
      });
      res = createMockResponse();
      mockFavoriteService.getFavoritesCount.mockResolvedValue(1);

      await controller.getFavoritesCount(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { count: 1 },
        })
      );

      // Get all favorites
      jest.clearAllMocks();
      req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
      });
      res = createMockResponse();
      mockFavoriteService.getFavorites.mockResolvedValue({
        data: [{ id: 'fav-1', productId: 'prod-1' }],
      });

      await controller.getFavorites(req, res);
      expect(res.json).toHaveBeenCalled();

      // Remove favorite
      jest.clearAllMocks();
      req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
        params: { productId: 'prod-1' },
      });
      res = createMockResponse();
      mockFavoriteService.removeFavorite.mockResolvedValue({
        id: 'fav-1',
        productId: 'prod-1',
      });

      await controller.removeFavorite(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle multiple favorites management', async () => {
      const customerId = 'cust-1';
      const productIds = ['prod-1', 'prod-2', 'prod-3'];

      // Add multiple favorites
      for (const productId of productIds) {
        const req = createMockRequest({
          user: { userId: customerId, role: 'CUSTOMER' },
          body: { productId },
        });
        const res = createMockResponse();
        mockFavoriteService.addFavorite.mockResolvedValue({
          id: `fav-${productId}`,
          productId,
          customerId,
        });

        await controller.addFavorite(req, res);
        expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
        jest.clearAllMocks();
      }

      // Verify count
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
      });
      const res = createMockResponse();
      mockFavoriteService.getFavoritesCount.mockResolvedValue(3);

      await controller.getFavoritesCount(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { count: 3 },
        })
      );
    });
  });
});

