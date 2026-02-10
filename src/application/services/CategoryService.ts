import { PrismaClient } from '@prisma/client';

export class CategoryService {
  constructor(private prisma: PrismaClient) {}

  // Get category tree (hierarchical)
  async getCategoryTree() {
    const categories = await this.prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null, // Only root categories
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories;
  }

  // Get featured categories (for homepage)
  async getFeaturedCategories(limit: number = 6) {
    const categories = await this.prisma.category.findMany({
      where: {
        isActive: true,
        isFeatured: true,
        parentId: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
      },
      orderBy: { sortOrder: 'asc' },
      take: limit,
    });

    return categories;
  }

  // Get category by slug with products
  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    return category;
  }

  // Get breadcrumb path for a category
  async getCategoryBreadcrumb(categoryId: string) {
    const breadcrumb = [];
    let currentId: string | null = categoryId;

    while (currentId) {
      const id: string = currentId;
      const category = await this.prisma.category.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
        },
      });

      if (!category) break;

      breadcrumb.unshift({
        id: category.id,
        name: category.name,
        slug: category.slug,
      });

      currentId = category.parentId;
    }

    return breadcrumb;
  }
}
