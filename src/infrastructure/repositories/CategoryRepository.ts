import { Category } from '../../domain/entities';
import { ICategoryRepository } from '../../domain/repositories';
import { prisma } from '../database/prisma';

export class CategoryRepository implements ICategoryRepository {
  async findAll(): Promise<Category[]> {
    return prisma.category.findMany();
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { name },
    });
  }

  async create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    return prisma.category.create({
      data,
    });
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    });
  }
}
