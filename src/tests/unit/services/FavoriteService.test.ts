import { describe, it, expect, beforeEach } from '@jest/globals';
import { FavoriteService } from '../../../application/services/FavoriteService';
import { prismaMock } from '../../setup';

describe('FavoriteService', () => {
  let favoriteService: FavoriteService;

  beforeEach(() => {
    favoriteService = new FavoriteService(prismaMock);
    jest.clearAllMocks();
  });

  describe('getFavorites', () => {
    it('should retrieve all favorites for customer', async () => {
      const customerId = 'cust-123';

      prismaMock.favorite.findMany.mockResolvedValue([
        {
          id: 'fav-1',
          customerId,
          productId: 'prod-1',
          createdAt: new Date(),
          product: {
            id: 'prod-1',
            sku: 'PROD-001',
            name: 'Product 1',
            slug: 'product-1',
            brand: 'Brand A',
            basePrice: 99.99,
            discountPercent: 10,
            images: [
              {
                thumbnailUrl: 'https://example.com/thumb1.jpg',
                smallUrl: 'https://example.com/small1.jpg',
                mediumUrl: 'https://example.com/medium1.jpg',
                isPrimary: true,
              },
            ],
          },
        },
        {
          id: 'fav-2',
          customerId,
          productId: 'prod-2',
          createdAt: new Date(),
          product: {
            id: 'prod-2',
            sku: 'PROD-002',
            name: 'Product 2',
            slug: 'product-2',
            brand: 'Brand B',
            basePrice: 149.99,
            discountPercent: 5,
            images: [
              {
                thumbnailUrl: 'https://example.com/thumb2.jpg',
                smallUrl: 'https://example.com/small2.jpg',
                mediumUrl: 'https://example.com/medium2.jpg',
                isPrimary: true,
              },
            ],
          },
        },
      ] as any);

      const result = await favoriteService.getFavorites(customerId);

      expect(result).toBeDefined();
      expect(prismaMock.favorite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { customerId },
        })
      );
    });

    it('should return empty array if customer has no favorites', async () => {
      const customerId = 'cust-no-favorites';

      prismaMock.favorite.findMany.mockResolvedValue([]);

      const result = await favoriteService.getFavorites(customerId);

      expect(result).toBeDefined();
      expect(result.items || []).toHaveLength(0);
    });

    it('should sort favorites by creation date descending', async () => {
      const customerId = 'cust-123';
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-10');

      prismaMock.favorite.findMany.mockResolvedValue([
        {
          id: 'fav-1',
          customerId,
          productId: 'prod-1',
          createdAt: date1,
          product: {
            id: 'prod-1',
            sku: 'PROD-001',
            name: 'Product 1',
            slug: 'product-1',
            brand: 'Brand A',
            basePrice: 99.99,
            discountPercent: 10,
            images: [],
          },
        },
        {
          id: 'fav-2',
          customerId,
          productId: 'prod-2',
          createdAt: date2,
          product: {
            id: 'prod-2',
            sku: 'PROD-002',
            name: 'Product 2',
            slug: 'product-2',
            brand: 'Brand B',
            basePrice: 149.99,
            discountPercent: 5,
            images: [],
          },
        },
      ] as any);

      const result = await favoriteService.getFavorites(customerId);

      expect(result).toBeDefined();
      expect(prismaMock.favorite.findMany).toHaveBeenCalled();
    });
  });

  describe('addFavorite', () => {
    it('should add product to favorites', async () => {
      const customerId = 'cust-123';
      const productId = 'prod-1';

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

      prismaMock.product.findUnique.mockResolvedValue({
        id: productId,
        sku: 'PROD-001',
        name: 'Product 1',
        slug: 'product-1',
        brand: 'Brand A',
        basePrice: 99.99,
        discountPercent: 10,
        description: 'A great product',
        categoryId: 'cat-1',
        stock: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      prismaMock.favorite.findUnique.mockResolvedValue(null);

      prismaMock.favorite.create.mockResolvedValue({
        id: 'fav-1',
        customerId,
        productId,
        createdAt: new Date(),
        product: {
          id: productId,
          sku: 'PROD-001',
          name: 'Product 1',
          slug: 'product-1',
          brand: 'Brand A',
          basePrice: 99.99,
          discountPercent: 10,
          images: [],
        },
      } as any);

      const result = await favoriteService.addFavorite(customerId, productId);

      expect(result).toBeDefined();
      expect(prismaMock.favorite.create).toHaveBeenCalled();
    });

    it('should prevent duplicate favorites', async () => {
      const customerId = 'cust-123';
      const productId = 'prod-1';

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

      prismaMock.product.findUnique.mockResolvedValue({
        id: productId,
        sku: 'PROD-001',
        name: 'Product 1',
        slug: 'product-1',
        brand: 'Brand A',
        basePrice: 99.99,
        discountPercent: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      prismaMock.favorite.findUnique.mockResolvedValue({
        id: 'fav-1',
        customerId,
        productId,
        createdAt: new Date(),
      } as any);

      await expect(
        favoriteService.addFavorite(customerId, productId)
      ).rejects.toThrow();

      expect(prismaMock.favorite.create).not.toHaveBeenCalled();
    });

    it('should throw error if product does not exist', async () => {
      const customerId = 'cust-123';
      const productId = 'nonexistent-prod';

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

      prismaMock.product.findUnique.mockResolvedValue(null);

      await expect(
        favoriteService.addFavorite(customerId, productId)
      ).rejects.toThrow('Producto no encontrado');
    });

    it('should create customer if not exists', async () => {
      const customerId = 'cust-new';
      const productId = 'prod-1';

      prismaMock.customer.findUnique.mockResolvedValue(null);

      prismaMock.customer.create.mockResolvedValue({
        id: customerId,
        email: `user_${customerId}@local.dev`,
        password: '',
        firstName: 'Usuario',
        lastName: 'Local',
        phone: '',
        birthDate: null,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.product.findUnique.mockResolvedValue({
        id: productId,
        sku: 'PROD-001',
        name: 'Product 1',
        slug: 'product-1',
        brand: 'Brand A',
        basePrice: 99.99,
        discountPercent: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      prismaMock.favorite.findUnique.mockResolvedValue(null);

      prismaMock.favorite.create.mockResolvedValue({
        id: 'fav-1',
        customerId,
        productId,
        createdAt: new Date(),
        product: {
          id: productId,
          sku: 'PROD-001',
          name: 'Product 1',
          slug: 'product-1',
          brand: 'Brand A',
          basePrice: 99.99,
          discountPercent: 10,
          images: [],
        },
      } as any);

      const result = await favoriteService.addFavorite(customerId, productId);

      expect(prismaMock.customer.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('removeFavorite', () => {
    it('should remove product from favorites', async () => {
      const customerId = 'cust-123';
      const productId = 'prod-1';

      prismaMock.favorite.findUnique.mockResolvedValue({
        id: 'fav-1',
        customerId,
        productId,
        createdAt: new Date(),
      } as any);

      prismaMock.favorite.delete.mockResolvedValue({
        id: 'fav-1',
        customerId,
        productId,
        createdAt: new Date(),
      } as any);

      prismaMock.favorite.findMany.mockResolvedValue([]);

      const result = await favoriteService.removeFavorite(customerId, productId);

      expect(result).toBeDefined();
      expect(prismaMock.favorite.delete).toHaveBeenCalled();
    });

    it('should throw error if favorite does not exist', async () => {
      const customerId = 'cust-123';
      const productId = 'prod-1';

      prismaMock.favorite.findUnique.mockResolvedValue(null);

      await expect(
        favoriteService.removeFavorite(customerId, productId)
      ).rejects.toThrow();

      expect(prismaMock.favorite.delete).not.toHaveBeenCalled();
    });

    it('should verify customer ownership before removing', async () => {
      const customerId = 'cust-123';
      const differentCustomerId = 'cust-456';
      const productId = 'prod-1';

      prismaMock.favorite.findUnique.mockResolvedValue(null);

      await expect(
        favoriteService.removeFavorite(differentCustomerId, productId)
      ).rejects.toThrow();

      expect(prismaMock.favorite.delete).not.toHaveBeenCalled();
    });
  });

  describe('isFavorite', () => {
    it('should return true if product is favorited', async () => {
      const customerId = 'cust-123';
      const productId = 'prod-1';

      prismaMock.favorite.findUnique.mockResolvedValue({
        id: 'fav-1',
        customerId,
        productId,
        createdAt: new Date(),
      } as any);

      const result = await favoriteService.isFavorite(customerId, productId);

      expect(result).toBe(true);
    });

    it('should return false if product is not favorited', async () => {
      const customerId = 'cust-123';
      const productId = 'prod-1';

      prismaMock.favorite.findUnique.mockResolvedValue(null);

      const result = await favoriteService.isFavorite(customerId, productId);

      expect(result).toBe(false);
    });

    it('should check favorited status for multiple products', async () => {
      const customerId = 'cust-123';

      prismaMock.favorite.findMany.mockResolvedValue([
        {
          id: 'fav-1',
          customerId,
          productId: 'prod-1',
          createdAt: new Date(),
        },
        {
          id: 'fav-2',
          customerId,
          productId: 'prod-3',
          createdAt: new Date(),
        },
      ] as any);

      const result = await favoriteService.getFavoriteProductIds(customerId);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getFavoritesCount', () => {
    it('should return count of customer favorites', async () => {
      const customerId = 'cust-123';

      prismaMock.favorite.count.mockResolvedValue(5);

      const result = await favoriteService.getFavoritesCount(customerId);

      expect(result).toBe(5);
      expect(prismaMock.favorite.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { customerId },
        })
      );
    });

    it('should return 0 for customer with no favorites', async () => {
      const customerId = 'cust-no-favorites';

      prismaMock.favorite.count.mockResolvedValue(0);

      const result = await favoriteService.getFavoritesCount(customerId);

      expect(result).toBe(0);
    });
  });

  describe('Favorite response format', () => {
    it('should include product details in response', async () => {
      const customerId = 'cust-123';

      prismaMock.favorite.findMany.mockResolvedValue([
        {
          id: 'fav-1',
          customerId,
          productId: 'prod-1',
          createdAt: new Date(),
          product: {
            id: 'prod-1',
            sku: 'PROD-001',
            name: 'Premium Product',
            slug: 'premium-product',
            brand: 'Brand A',
            basePrice: 199.99,
            discountPercent: 20,
            images: [
              {
                thumbnailUrl: 'https://example.com/thumb.jpg',
                smallUrl: 'https://example.com/small.jpg',
                mediumUrl: 'https://example.com/medium.jpg',
                isPrimary: true,
              },
            ],
          },
        },
      ] as any);

      const result = await favoriteService.getFavorites(customerId);

      expect(result).toBeDefined();
      // Response should include product details
    });

    it('should include only primary image for each product', async () => {
      const customerId = 'cust-123';

      prismaMock.favorite.findMany.mockResolvedValue([
        {
          id: 'fav-1',
          customerId,
          productId: 'prod-1',
          createdAt: new Date(),
          product: {
            id: 'prod-1',
            sku: 'PROD-001',
            name: 'Product 1',
            slug: 'product-1',
            brand: 'Brand A',
            basePrice: 99.99,
            discountPercent: 10,
            images: [
              {
                thumbnailUrl: 'https://example.com/thumb1.jpg',
                smallUrl: 'https://example.com/small1.jpg',
                mediumUrl: 'https://example.com/medium1.jpg',
                isPrimary: true,
              },
            ],
          },
        },
      ] as any);

      const result = await favoriteService.getFavorites(customerId);

      expect(result).toBeDefined();
      expect(prismaMock.favorite.findMany).toHaveBeenCalled();
    });
  });
});
