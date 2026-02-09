import { Supplier } from '../../domain/entities';
import { ISupplierRepository } from '../../domain/repositories';
import { prisma } from '../database/prisma';

export class SupplierRepository implements ISupplierRepository {
  async findAll(): Promise<Supplier[]> {
    return prisma.supplier.findMany();
  }

  async findById(id: string): Promise<Supplier | null> {
    return prisma.supplier.findUnique({
      where: { id },
    });
  }

  async create(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    return prisma.supplier.create({
      data,
    });
  }

  async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.supplier.delete({
      where: { id },
    });
  }
}
