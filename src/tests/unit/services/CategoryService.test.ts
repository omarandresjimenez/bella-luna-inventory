import { describe, it, expect, beforeEach } from '@jest/globals';
import { CategoryService } from '../../../application/services/CategoryService';
import { prismaMock } from '../../setup';
import { TestDataBuilder } from '../../test-utils';

describe('CategoryService', () => {
  let categoryService: CategoryService;

  beforeEach(() => {
    jest.clearAllMocks();
    categoryService = new CategoryService(prismaMock as any);
  });

  describe('getCategoryTree', () => {
    it('should return hierarchical category structure', async () => {
      const mockCategories = [
        {
          ...TestDataBuilder.aCategory({ id: 'cat-1', name: 'Electronics' }),
          children: [
            TestDataBuilder.aCategory({ id: 'cat-1-1', name: 'Phones', parentId: 'cat-1' }),
            TestDataBuilder.aCategory({ id: 'cat-1-2', name: 'Laptops', parentId: 'cat-1' }),
          ],
        },
        {
          ...TestDataBuilder.aCategory({ id: 'cat-2', name: 'Clothing' }),
          children: [],
        },
      ];

      prismaMock.category.findMany.mockResolvedValueOnce(mockCategories as any);

      const result = await categoryService.getCategoryTree();

      expect(result).toHaveLength(2);
      expect(result[0].children).toHaveLength(2);
    });

    it('should only return root categories', async () => {
      const mockCategories = [
        TestDataBuilder.aCategory({ id: 'cat-1', parentId: null }),
        TestDataBuilder.aCategory({ id: 'cat-2', parentId: null }),
      ];

      prismaMock.category.findMany.mockResolvedValueOnce(mockCategories as any);

      const result = await categoryService.getCategoryTree();

      expect(result).toEqual(mockCategories);
    });

    it('should handle empty category tree', async () => {
      prismaMock.category.findMany.mockResolvedValueOnce([]);

      const result = await categoryService.getCategoryTree();

      expect(result).toEqual([]);
    });
  });

  describe('getFeaturedCategories', () => {
    it('should return featured categories up to limit', async () => {
      const mockFeatured = [
        TestDataBuilder.aCategory({ id: 'feat-1', isFeatured: true }),
        TestDataBuilder.aCategory({ id: 'feat-2', isFeatured: true }),
        TestDataBuilder.aCategory({ id: 'feat-3', isFeatured: true }),
      ];

      prismaMock.category.findMany.mockResolvedValueOnce(mockFeatured as any);

      const result = await categoryService.getFeaturedCategories(3);

      expect(result).toHaveLength(3);
    });

    it('should use default limit of 6', async () => {
      const mockFeatured = Array(6).fill(null).map((_, i) =>
        TestDataBuilder.aCategory({ isFeatured: true })
      );

      prismaMock.category.findMany.mockResolvedValueOnce(mockFeatured as any);

      const result = await categoryService.getFeaturedCategories();

      expect(result).toHaveLength(6);
    });

    it('should handle fewer results than limit', async () => {
      const mockFeatured = [
        TestDataBuilder.aCategory({ isFeatured: true }),
        TestDataBuilder.aCategory({ isFeatured: true }),
      ];

      prismaMock.category.findMany.mockResolvedValueOnce(mockFeatured as any);

      const result = await categoryService.getFeaturedCategories(10);

      expect(result).toHaveLength(2);
    });
  });

  describe('getCategoryBySlug', () => {
    it('should return category with parent and children', async () => {
      const mockCategory = {
        ...TestDataBuilder.aCategory({ slug: 'electronics' }),
        parent: null,
        children: [
          TestDataBuilder.aCategory({ name: 'Phones' }),
          TestDataBuilder.aCategory({ name: 'Laptops' }),
        ],
      };

      prismaMock.category.findUnique.mockResolvedValueOnce(mockCategory as any);

      const result = await categoryService.getCategoryBySlug('electronics');

      expect(result).toEqual(mockCategory);
      expect(result.children).toHaveLength(2);
    });

    it('should throw error if category not found', async () => {
      prismaMock.category.findUnique.mockResolvedValueOnce(null);

      await expect(
        categoryService.getCategoryBySlug('nonexistent')
      ).rejects.toThrow('Categoría no encontrada');
    });
  });

  describe('getCategoryBreadcrumb', () => {
    it('should return breadcrumb path for category', async () => {
      prismaMock.category.findUnique
        .mockResolvedValueOnce({
          id: 'cat-1-1',
          name: 'Phones',
          slug: 'phones',
          parentId: 'cat-1',
        } as any)
        .mockResolvedValueOnce({
          id: 'cat-1',
          name: 'Electronics',
          slug: 'electronics',
          parentId: null,
        } as any);

      const result = await categoryService.getCategoryBreadcrumb('cat-1-1');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Phones');
      expect(result[1].name).toBe('Electronics');
    });

    it('should handle root category with no parent', async () => {
      prismaMock.category.findUnique.mockResolvedValueOnce({
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
        parentId: null,
      } as any);

      const result = await categoryService.getCategoryBreadcrumb('cat-1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Electronics');
    });
  });
});
