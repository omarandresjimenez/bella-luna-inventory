import { Product } from '../../domain/entities';
import { IProductRepository } from '../../domain/repositories';
import { prisma } from '../database/prisma';

export class ProductRepository implements IProductRepository {
  async findAll(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        supplier: true,
      },
    });
    return products.map(this.mapToEntity);
  }

  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
      },
    });
    return product ? this.mapToEntity(product) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
        supplier: true,
      },
    });
    return product ? this.mapToEntity(product) : null;
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { categoryId },
      include: {
        category: true,
        supplier: true,
      },
    });
    return products.map(this.mapToEntity);
  }

  async findLowStock(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: {
        quantity: {
          lte: prisma.product.fields.minStock,
        },
      },
      include: {
        category: true,
        supplier: true,
      },
    });
    return products.map(this.mapToEntity);
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const product = await prisma.product.create({
      data: {
        ...data,
        unitCost: data.unitCost,
        salePrice: data.salePrice,
      },
      include: {
        category: true,
        supplier: true,
      },
    });
    return this.mapToEntity(product);
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        unitCost: data.unitCost,
        salePrice: data.salePrice,
      },
      include: {
        category: true,
        supplier: true,
      },
    });
    return this.mapToEntity(product);
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id },
    });
  }

  private mapToEntity(product: any): Product {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description || undefined,
      unitCost: Number(product.unitCost),
      salePrice: Number(product.salePrice),
      quantity: product.quantity,
      minStock: product.minStock,
      maxStock: product.maxStock,
      location: product.location || undefined,
      barcode: product.barcode || undefined,
      isActive: product.isActive,
      categoryId: product.categoryId,
      supplierId: product.supplierId || undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
