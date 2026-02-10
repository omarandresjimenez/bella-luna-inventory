import { Category } from '../../domain/entities';
import { ICategoryRepository } from '../../domain/repositories';
import { prisma } from '../database/prisma';

export class CategoryRepository implements ICategoryRepository {
  async findAll(): Promise<Category[]> {
    const categories = await prisma.category.findMany();
    return categories.map(this.mapToEntity);
  }

  async findById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    return category ? this.mapToEntity(category) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    const category = await prisma.category.findFirst({
      where: { name },
    });
    return category ? this.mapToEntity(category) : null;
  }

  async create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    // Ensure slug exists
    const slug = data.slug || data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const category = await prisma.category.create({
      data: {
        ...data,
        slug,
      },
    });
    return this.mapToEntity(category);
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const category = await prisma.category.update({
      where: { id },
      data,
    });
    return this.mapToEntity(category);
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    });
  }

  private mapToEntity(category: any): Category {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || undefined,
      parentId: category.parentId || undefined,
      imageUrl: category.imageUrl || undefined,
      isActive: category.isActive,
      isFeatured: category.isFeatured,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
