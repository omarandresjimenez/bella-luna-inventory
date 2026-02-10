import { PrismaClient } from '@prisma/client';
import { Category } from '@prisma/client';

export interface CreateCategoryDTO {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  imageUrl?: string;
}

export class CategoryAdminService {
  constructor(private prisma: PrismaClient) {}

  // Get all categories (admin view with full details)
  async getAllCategories(): Promise<Category[]> {
    return this.prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                isActive: true
              }
            }
          }
        }
      }
    });
  }

  // Create new category
  async createCategory(data: CreateCategoryDTO): Promise<Category> {
    // Check for duplicate slug
    const existing = await this.prisma.category.findUnique({
      where: { slug: data.slug }
    });

    if (existing) {
      throw new Error('Ya existe una categoría con ese slug');
    }

    // Validate parent exists if provided
    if (data.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: data.parentId }
      });
      if (!parent) {
        throw new Error('Categoría padre no encontrada');
      }
    }

    return this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        parentId: data.parentId,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        sortOrder: data.sortOrder ?? 0
      }
    });
  }

  // Update category
  async updateCategory(id: string, data: UpdateCategoryDTO): Promise<Category> {
    const existing = await this.prisma.category.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new Error('Categoría no encontrada');
    }

    // Check for duplicate slug if changing slug
    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await this.prisma.category.findUnique({
        where: { slug: data.slug }
      });
      if (duplicate) {
        throw new Error('Ya existe una categoría con ese slug');
      }
    }

    // Validate parent exists if provided
    if (data.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: data.parentId }
      });
      if (!parent) {
        throw new Error('Categoría padre no encontrada');
      }
      // Prevent circular reference
      if (data.parentId === id) {
        throw new Error('Una categoría no puede ser su propia padre');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data
    });
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: true
      }
    });

    if (!existing) {
      throw new Error('Categoría no encontrada');
    }

    if (existing.children.length > 0) {
      throw new Error('No se puede eliminar una categoría con subcategorías');
    }

    if (existing.products.length > 0) {
      throw new Error('No se puede eliminar una categoría con productos asociados');
    }

    await this.prisma.category.delete({
      where: { id }
    });
  }

  // Update category image URL
  async updateCategoryImage(id: string, imageUrl: string | null): Promise<Category> {
    const existing = await this.prisma.category.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new Error('Categoría no encontrada');
    }

    return this.prisma.category.update({
      where: { id },
      data: { imageUrl }
    });
  }
}
