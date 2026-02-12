import { PrismaClient } from '@prisma/client';
import { FavoriteResponse, FavoriteItemResponse } from '../dtos/favorite.dto.js';

interface FavoriteWithProduct {
  id: string;
  customerId: string;
  productId: string;
  createdAt: Date;
  product: {
    id: string;
    sku: string;
    name: string;
    slug: string;
    brand: string | null;
    basePrice: unknown;
    discountPercent: unknown;
    images: Array<{
      thumbnailUrl: string;
      smallUrl: string;
      mediumUrl: string;
      isPrimary: boolean;
    }>;
  };
}

export class FavoriteService {
  constructor(private prisma: PrismaClient) {}

  // Get all favorites for a customer
  async getFavorites(customerId: string): Promise<FavoriteResponse> {
    const favorites = await this.prisma.favorite.findMany({
      where: { customerId },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            slug: true,
            brand: true,
            basePrice: true,
            discountPercent: true,
            images: {
              select: {
                thumbnailUrl: true,
                smallUrl: true,
                mediumUrl: true,
                isPrimary: true,
              },
              orderBy: {
                isPrimary: 'desc',
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.transformFavoritesResponse(favorites as unknown as FavoriteWithProduct[]);
  }

  // Add product to favorites
  async addFavorite(customerId: string, productId: string): Promise<FavoriteResponse> {
    // Verify or create customer
    let customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      // Customer doesn't exist - create a minimal customer record
      console.warn(`Creating customer record for ${customerId}`);
      customer = await this.prisma.customer.create({
        data: {
          id: customerId,
          email: `user_${customerId}@local.dev`, // Placeholder email
          firstName: 'Usuario',
          lastName: 'Local',
          password: '', // Placeholder - won't be used
          phone: '', // Placeholder
        },
      });
    }

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    // Check if already favorited
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        customerId_productId: {
          customerId,
          productId,
        },
      },
    });

    if (existingFavorite) {
      // Already favorited, return current favorites
      return this.getFavorites(customerId);
    }

    // Create favorite
    await this.prisma.favorite.create({
      data: {
        customerId,
        productId,
      },
    });

    return this.getFavorites(customerId);
  }

  // Remove product from favorites
  async removeFavorite(customerId: string, productId: string): Promise<FavoriteResponse> {
    // Check if favorite exists
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        customerId_productId: {
          customerId,
          productId,
        },
      },
    });

    if (!favorite) {
      throw new Error('Producto no estÃ¡ en favoritos');
    }

    // Delete favorite
    await this.prisma.favorite.delete({
      where: {
        customerId_productId: {
          customerId,
          productId,
        },
      },
    });

    return this.getFavorites(customerId);
  }

  // Check if product is favorited
  async isFavorite(customerId: string, productId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        customerId_productId: {
          customerId,
          productId,
        },
      },
    });

    return !!favorite;
  }

  // Get favorite product IDs for quick lookup
  async getFavoriteProductIds(customerId: string): Promise<string[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { customerId },
      select: { productId: true },
    });

    return favorites.map(f => f.productId);
  }

  // Helper: Transform favorites to response
  private transformFavoritesResponse(favorites: FavoriteWithProduct[]): FavoriteResponse {
    const items: FavoriteItemResponse[] = favorites.map((favorite) => {
      const product = favorite.product;
      const discount = Number(product.discountPercent || 0);
      const basePrice = Number(product.basePrice);
      const finalPrice = basePrice * (1 - discount / 100);
      const image = product.images[0];

      return {
        id: favorite.id,
        productId: product.id,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        basePrice,
        discountPercent: discount,
        finalPrice,
        imageUrl: image?.mediumUrl || image?.smallUrl || image?.thumbnailUrl,
        createdAt: favorite.createdAt.toISOString(),
      };
    });

    return {
      items,
      total: items.length,
    };
  }
}

