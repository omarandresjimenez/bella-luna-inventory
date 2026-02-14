import { describe, it, expect, beforeEach } from '@jest/globals';
import { AdminCategoryController } from '../../../interface/controllers/AdminCategoryController.js';
import { createMockRequest, createMockResponse } from '../../test-utils.js';
import { HttpStatus } from '../../../shared/utils/api-response.js';

describe('AdminCategoryController', () => {
  let controller: AdminCategoryController;
  let mockCategoryService: any;

  beforeEach(() => {
    mockCategoryService = {
      getAllCategories: jest.fn(),
      getCategoryById: jest.fn(),
      createCategory: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn(),
    };
    controller = new AdminCategoryController(mockCategoryService);
    jest.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Electronics',
          slug: 'electronics',
          description: 'Electronic products',
          isActive: true,
          isFeatured: true,
          sortOrder: 1,
        },
        {
          id: 'cat-2',
          name: 'Clothing',
          slug: 'clothing',
          description: 'Clothing items',
          isActive: true,
          isFeatured: false,
          sortOrder: 2,
        },
      ];

      const req = createMockRequest();
      const res = createMockResponse();
      mockCategoryService.getAllCategories.mockResolvedValue(mockCategories);

      await controller.getAllCategories(req, res);

      expect(mockCategoryService.getAllCategories).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockCategories,
        })
      );
    });

    it('should return empty list when no categories exist', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      mockCategoryService.getAllCategories.mockResolvedValue([]);

      await controller.getAllCategories(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: [],
        })
      );
    });

    it('should handle service errors', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      mockCategoryService.getAllCategories.mockRejectedValue(new Error('Database error'));

      await controller.getAllCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        })
      );
    });

    it('should handle non-Error objects thrown by service', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      mockCategoryService.getAllCategories.mockRejectedValue('Unknown error');

      await controller.getAllCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('getCategoryById', () => {
    it('should return category by ID', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products',
        isActive: true,
        isFeatured: true,
        sortOrder: 1,
        parentId: null,
        children: [],
      };

      const req = createMockRequest({
        params: { id: 'cat-1' },
      });
      const res = createMockResponse();
      mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);

      await controller.getCategoryById(req, res);

      expect(mockCategoryService.getCategoryById).toHaveBeenCalledWith('cat-1');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockCategory,
        })
      );
    });

    it('should return 404 when category not found', async () => {
      const req = createMockRequest({
        params: { id: 'nonexistent' },
      });
      const res = createMockResponse();
      mockCategoryService.getCategoryById.mockResolvedValue(null);

      await controller.getCategoryById(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Categoría no encontrada'),
        })
      );
    });

    it('should return category with nested children', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Electronics',
        slug: 'electronics',
        parentId: null,
        children: [
          {
            id: 'cat-1-1',
            name: 'Laptops',
            slug: 'laptops',
            parentId: 'cat-1',
          },
          {
            id: 'cat-1-2',
            name: 'Phones',
            slug: 'phones',
            parentId: 'cat-1',
          },
        ],
      };

      const req = createMockRequest({
        params: { id: 'cat-1' },
      });
      const res = createMockResponse();
      mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);

      await controller.getCategoryById(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 'cat-1',
            children: expect.arrayContaining([
              expect.objectContaining({ name: 'Laptops' }),
            ]),
          }),
        })
      );
    });

    it('should handle service errors', async () => {
      const req = createMockRequest({
        params: { id: 'cat-1' },
      });
      const res = createMockResponse();
      mockCategoryService.getCategoryById.mockRejectedValue(new Error('Database error'));

      await controller.getCategoryById(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('createCategory', () => {
    it('should create category successfully with all fields', async () => {
      const categoryData = {
        name: 'New Category',
        slug: 'new-category',
        description: 'A new category',
        isActive: true,
        isFeatured: false,
        sortOrder: 3,
      };

      const mockCategory = {
        id: 'cat-new',
        ...categoryData,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const req = createMockRequest({
        body: categoryData,
      });
      const res = createMockResponse();
      mockCategoryService.createCategory.mockResolvedValue(mockCategory);

      await controller.createCategory(req, res);

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(categoryData);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockCategory,
        })
      );
    });

    it('should validate required name field', async () => {
      const req = createMockRequest({
        body: {
          slug: 'new-category',
          // Missing required name field
        },
      });
      const res = createMockResponse();

      await controller.createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        })
      );
    });

    it('should validate required slug field', async () => {
      const req = createMockRequest({
        body: {
          name: 'New Category',
          // Missing required slug field
        },
      });
      const res = createMockResponse();

      await controller.createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should validate slug format (lowercase and hyphens only)', async () => {
      const req = createMockRequest({
        body: {
          name: 'New Category',
          slug: 'Invalid Slug With Spaces', // Invalid slug format
        },
      });
      const res = createMockResponse();

      await controller.createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Slug debe contener'),
        })
      );
    });

    it('should accept valid slug formats', async () => {
      const validSlugs = ['electronics', 'home-appliances', 'sports-123'];

      for (const slug of validSlugs) {
        const categoryData = {
          name: 'Test Category',
          slug,
        };

        const mockCategory = {
          id: 'cat-new',
          ...categoryData,
        };

        const req = createMockRequest({
          body: categoryData,
        });
        const res = createMockResponse();
        mockCategoryService.createCategory.mockResolvedValue(mockCategory);

        await controller.createCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
        jest.clearAllMocks();
      }
    });

    it('should create category with optional fields', async () => {
      const categoryData = {
        name: 'Simple Category',
        slug: 'simple-category',
        description: 'A simple category',
        // isFeatured, sortOrder, parentId are optional
      };

      const mockCategory = {
        id: 'cat-new',
        ...categoryData,
        isFeatured: false,
        sortOrder: 0,
        parentId: null,
      };

      const req = createMockRequest({
        body: categoryData,
      });
      const res = createMockResponse();
      mockCategoryService.createCategory.mockResolvedValue(mockCategory);

      await controller.createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    });

    it('should create category with parent category', async () => {
      const categoryData = {
        name: 'Subcategory',
        slug: 'subcategory',
        parentId: 'cat-1', // Parent category ID
      };

      const mockCategory = {
        id: 'cat-sub',
        ...categoryData,
        parent: {
          id: 'cat-1',
          name: 'Parent Category',
        },
      };

      const req = createMockRequest({
        body: categoryData,
      });
      const res = createMockResponse();
      mockCategoryService.createCategory.mockResolvedValue(mockCategory);

      await controller.createCategory(req, res);

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(
        expect.objectContaining({ parentId: 'cat-1' })
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    });

    it('should handle service validation errors', async () => {
      const req = createMockRequest({
        body: {
          name: 'New Category',
          slug: 'new-category',
        },
      });
      const res = createMockResponse();
      mockCategoryService.createCategory.mockRejectedValue(
        new Error('Slug already exists')
      );

      await controller.createCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Slug already exists'),
        })
      );
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const updateData = {
        name: 'Updated Category',
        description: 'Updated description',
      };

      const mockUpdatedCategory = {
        id: 'cat-1',
        name: 'Updated Category',
        slug: 'electronics',
        description: 'Updated description',
        isActive: true,
        updatedAt: new Date(),
      };

      const req = createMockRequest({
        params: { id: 'cat-1' },
        body: updateData,
      });
      const res = createMockResponse();
      mockCategoryService.updateCategory.mockResolvedValue(mockUpdatedCategory);

      await controller.updateCategory(req, res);

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith('cat-1', updateData);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUpdatedCategory,
        })
      );
    });

    it('should handle partial updates', async () => {
      const updateData = {
        name: 'Only Name Updated',
      };

      const mockUpdatedCategory = {
        id: 'cat-1',
        name: 'Only Name Updated',
        slug: 'electronics',
        description: 'Original description',
      };

      const req = createMockRequest({
        params: { id: 'cat-1' },
        body: updateData,
      });
      const res = createMockResponse();
      mockCategoryService.updateCategory.mockResolvedValue(mockUpdatedCategory);

      await controller.updateCategory(req, res);

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith('cat-1', updateData);
    });

    it('should validate slug format on update', async () => {
      const req = createMockRequest({
        params: { id: 'cat-1' },
        body: {
          slug: 'INVALID Slug Format', // Invalid format
        },
      });
      const res = createMockResponse();

      await controller.updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should return 404 when category not found on update', async () => {
      const req = createMockRequest({
        params: { id: 'nonexistent' },
        body: { name: 'Updated' },
      });
      const res = createMockResponse();
      mockCategoryService.updateCategory.mockRejectedValue(
        new Error('Categoría no encontrada')
      );

      await controller.updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Categoría no encontrada'),
        })
      );
    });

    it('should handle duplicate slug error', async () => {
      const req = createMockRequest({
        params: { id: 'cat-1' },
        body: {
          slug: 'existing-slug', // Already used slug
        },
      });
      const res = createMockResponse();
      mockCategoryService.updateCategory.mockRejectedValue(
        new Error('Slug already exists')
      );

      await controller.updateCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should update featured status', async () => {
      const updateData = {
        isFeatured: true,
      };

      const mockUpdatedCategory = {
        id: 'cat-1',
        name: 'Electronics',
        isFeatured: true,
      };

      const req = createMockRequest({
        params: { id: 'cat-1' },
        body: updateData,
      });
      const res = createMockResponse();
      mockCategoryService.updateCategory.mockResolvedValue(mockUpdatedCategory);

      await controller.updateCategory(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ isFeatured: true }),
        })
      );
    });

    it('should update active status', async () => {
      const updateData = {
        isActive: false,
      };

      const mockUpdatedCategory = {
        id: 'cat-1',
        name: 'Electronics',
        isActive: false,
      };

      const req = createMockRequest({
        params: { id: 'cat-1' },
        body: updateData,
      });
      const res = createMockResponse();
      mockCategoryService.updateCategory.mockResolvedValue(mockUpdatedCategory);

      await controller.updateCategory(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ isActive: false }),
        })
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      const mockDeletedCategory = {
        id: 'cat-1',
        name: 'Electronics',
      };

      const req = createMockRequest({
        params: { id: 'cat-1' },
      });
      const res = createMockResponse();
      mockCategoryService.deleteCategory.mockResolvedValue(mockDeletedCategory);

      await controller.deleteCategory(req, res);

      expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith('cat-1');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockDeletedCategory,
        })
      );
    });

    it('should return 404 when deleting non-existent category', async () => {
      const req = createMockRequest({
        params: { id: 'nonexistent' },
      });
      const res = createMockResponse();
      mockCategoryService.deleteCategory.mockRejectedValue(
        new Error('Categoría no encontrada')
      );

      await controller.deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('should prevent deletion of category with products', async () => {
      const req = createMockRequest({
        params: { id: 'cat-1' },
      });
      const res = createMockResponse();
      mockCategoryService.deleteCategory.mockRejectedValue(
        new Error('Cannot delete category with products')
      );

      await controller.deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Cannot delete category with products'),
        })
      );
    });

    it('should handle service errors during deletion', async () => {
      const req = createMockRequest({
        params: { id: 'cat-1' },
      });
      const res = createMockResponse();
      mockCategoryService.deleteCategory.mockRejectedValue(new Error('Database error'));

      await controller.deleteCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete category lifecycle', async () => {
      // Create category
      const createData = {
        name: 'New Category',
        slug: 'new-category',
        description: 'A new category',
      };

      const mockCreatedCategory = {
        id: 'cat-new',
        ...createData,
        isActive: true,
      };

      let req = createMockRequest({
        body: createData,
      });
      let res = createMockResponse();
      mockCategoryService.createCategory.mockResolvedValue(mockCreatedCategory);

      await controller.createCategory(req, res);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);

      // Get category
      jest.clearAllMocks();
      req = createMockRequest({
        params: { id: 'cat-new' },
      });
      res = createMockResponse();
      mockCategoryService.getCategoryById.mockResolvedValue(mockCreatedCategory);

      await controller.getCategoryById(req, res);
      expect(res.json).toHaveBeenCalled();

      // Update category
      jest.clearAllMocks();
      const updateData = {
        description: 'Updated description',
        isFeatured: true,
      };

      const mockUpdatedCategory = {
        ...mockCreatedCategory,
        ...updateData,
      };

      req = createMockRequest({
        params: { id: 'cat-new' },
        body: updateData,
      });
      res = createMockResponse();
      mockCategoryService.updateCategory.mockResolvedValue(mockUpdatedCategory);

      await controller.updateCategory(req, res);
      expect(res.json).toHaveBeenCalled();

      // Delete category
      jest.clearAllMocks();
      req = createMockRequest({
        params: { id: 'cat-new' },
      });
      res = createMockResponse();
      mockCategoryService.deleteCategory.mockResolvedValue(mockCreatedCategory);

      await controller.deleteCategory(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle category hierarchy management', async () => {
      // Get parent category
      let req = createMockRequest({
        params: { id: 'cat-1' },
      });
      let res = createMockResponse();
      const mockParentCategory = {
        id: 'cat-1',
        name: 'Electronics',
        children: [],
      };
      mockCategoryService.getCategoryById.mockResolvedValue(mockParentCategory);

      await controller.getCategoryById(req, res);
      expect(res.json).toHaveBeenCalled();

      // Create subcategory
      jest.clearAllMocks();
      const subData = {
        name: 'Laptops',
        slug: 'laptops',
        parentId: 'cat-1',
      };

      const mockSubcategory = {
        id: 'cat-1-1',
        ...subData,
      };

      req = createMockRequest({
        body: subData,
      });
      res = createMockResponse();
      mockCategoryService.createCategory.mockResolvedValue(mockSubcategory);

      await controller.createCategory(req, res);
      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(
        expect.objectContaining({ parentId: 'cat-1' })
      );
    });
  });
});
