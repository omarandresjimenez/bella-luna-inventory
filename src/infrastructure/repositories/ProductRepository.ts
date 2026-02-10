import { Product } from '../../domain/entities';
import { IProductRepository } from '../../domain/repositories';
import { prisma } from '../database/prisma';

export class ProductRepository implements IProductRepository {
  async findAll(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        variants: true,
      },
    });
    return products.map(p => this.mapToEntity(p));
  }

  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        variants: true,
      },
    });
    return product ? this.mapToEntity(product) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { sku },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        variants: true,
      },
    });
    return product ? this.mapToEntity(product) : null;
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: {
        categories: {
          some: {
            categoryId,
          },
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        variants: true,
      },
    });
    return products.map(p => this.mapToEntity(p));
  }

  async findLowStock(): Promise<Product[]> {
    // Since minStock is not in Product model, we check if any variant has low stock (e.g. < 5)
    // Or if legacy, we might just return empty if logically impossible.
    // For now, attempting to mimic old logic for products with variants having low stock
    const products = await prisma.product.findMany({
      where: {
        variants: {
          some: {
            stock: {
              lte: 5, // Hardcoded threshold as minStock is missing
            },
          },
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        variants: true,
      },
    });
    return products.map(p => this.mapToEntity(p));
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    // Map domain fields to schema fields
    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        slug: data.sku.toLowerCase(), // basic slug generation
        baseCost: data.unitCost,
        basePrice: data.salePrice,
        trackStock: true, // Default
        isActive: data.isActive,
        // Relations
        categories: {
          create: {
            category: {
              connect: { id: data.categoryId }
            }
          }
        }
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        variants: true,
      },
    });
    return this.mapToEntity(product);
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const updateData: any = { ...data };

    if (data.unitCost !== undefined) updateData.baseCost = data.unitCost;
    if (data.salePrice !== undefined) updateData.basePrice = data.salePrice;

    // Removing unmapped fields
    delete updateData.unitCost;
    delete updateData.salePrice;
    delete updateData.quantity;
    delete updateData.minStock;
    delete updateData.maxStock;
    delete updateData.location;
    delete updateData.barcode;
    delete updateData.supplierId;
    delete updateData.categoryId; // Handling relation separately if needed

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        variants: true,
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
    const quantity = product.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0;

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description || undefined,
      unitCost: typeof product.baseCost?.toNumber === 'function' ? product.baseCost.toNumber() : Number(product.baseCost),
      salePrice: typeof product.basePrice?.toNumber === 'function' ? product.basePrice.toNumber() : Number(product.basePrice),
      quantity: quantity,
      minStock: 0,
      maxStock: 0,
      location: undefined,
      barcode: undefined,
      isActive: product.isActive,
      categoryId: product.categories?.[0]?.categoryId || '',
      supplierId: undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
