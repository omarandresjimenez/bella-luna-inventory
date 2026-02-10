import { Supplier } from '../../domain/entities';
import { ISupplierRepository } from '../../domain/repositories';
import { prisma } from '../database/prisma';

export class SupplierRepository implements ISupplierRepository {
  async findAll(): Promise<Supplier[]> {
    // Supplier model not implemented in schema yet
    return [];
  }

  async findById(id: string): Promise<Supplier | null> {
    return null;
  }

  async create(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    throw new Error('Supplier not implemented');
  }

  async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
    throw new Error('Supplier not implemented');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Supplier not implemented');
  }

  private mapToEntity(supplier: any): Supplier {
    return {
      id: supplier.id,
      name: supplier.name,
      contactName: supplier.contactName || undefined,
      email: supplier.email || undefined,
      phone: supplier.phone || undefined,
      address: supplier.address || undefined,
      isActive: supplier.isActive,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    };
  }
}
