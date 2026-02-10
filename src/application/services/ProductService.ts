import { Prisma, PrismaClient } from '@prisma/client';
import { ProductFilterDTO } from '../dtos/product.dto';

export class ProductService {
  constructor(private prisma: PrismaClient) {}
  // List products with filters (public catalog)
  async getProducts(filters: ProductFilterDTO) {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 24,
      search,
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      isDeleted: false,
    };

    // Category filter
    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    // Brand filter
    if (brand) {
      where.brand = {
        equals: brand,
        mode: 'insensitive',
      };
    }

    // Price filter (check if any variant is within range)
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.variants = {
        some: {
          AND: [
            minPrice !== undefined ? { price: { gte: minPrice } } : {},
            maxPrice !== undefined ? { price: { lte: maxPrice } } : {},
          ],
        },
      };
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case 'price_asc':
        orderBy = { basePrice: 'asc' };
        break;
      case 'price_desc':
        orderBy = { basePrice: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'popular':
        // In production, you might sort by sales count
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Execute queries
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: {
              id: true,
              thumbnailUrl: true,
              smallUrl: true,
              mediumUrl: true,
            },
          },
          variants: {
            where: { isActive: true },
            include: {
              attributeValues: {
                include: {
                  attributeValue: {
                    include: {
                      attribute: true,
                    },
                  },
                },
              },
            },
          },
          attributes: {
            include: {
              attribute: true,
            },
          },
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      this.prisma.product.count({ where }),
    ]);

    // Transform products for response
    const transformedProducts = products.map((product) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      description: product.description,
      brand: product.brand,
      basePrice: Number(product.basePrice),
      discountPercent: Number(product.discountPercent),
      finalPrice: this.calculateFinalPrice(product.basePrice, product.discountPercent),
      hasVariants: product.variants.length > 0,
      categories: product.categories.map((pc) => pc.category),
      images: product.images, // Return images array instead of primaryImage
      variantCount: product.variants.length,
    }));

    return {
      products: transformedProducts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 8) {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        isFeatured: true,
      },
      include: {
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: {
            id: true,
            thumbnailUrl: true,
            smallUrl: true,
            mediumUrl: true,
          },
        },
        variants: {
          where: { isActive: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return products.map((product) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      basePrice: Number(product.basePrice),
      discountPercent: Number(product.discountPercent),
      finalPrice: this.calculateFinalPrice(product.basePrice, product.discountPercent),
      categories: product.categories.map((pc) => pc.category),
      images: product.images, // Return images array instead of primaryImage
      hasVariants: product.variants.length > 0,
    }));
  }

  // Get product by slug (detail view)
  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        slug,
        isActive: true,
        isDeleted: false,
      },
      include: {
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            thumbnailUrl: true,
            smallUrl: true,
            mediumUrl: true,
            largeUrl: true,
            isPrimary: true,
            altText: true,
          },
        },
        variants: {
          where: { isActive: true },
          include: {
            attributeValues: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true,
                  },
                },
              },
            },
            images: {
              take: 1,
              select: {
                thumbnailUrl: true,
              },
            },
          },
        },
        attributes: {
          include: {
            attribute: {
              include: {
                values: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    // Transform variant combinations
    const transformedVariants = product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.variantSku || product.sku,
      price: variant.price ? Number(variant.price) : Number(product.basePrice),
      cost: variant.cost ? Number(variant.cost) : Number(product.baseCost),
      stock: variant.stock,
      attributes: variant.attributeValues.map((av) => ({
        name: av.attributeValue.attribute.name,
        value: av.attributeValue.value,
        displayValue: av.attributeValue.displayValue || av.attributeValue.value,
        colorHex: av.attributeValue.colorHex,
      })),
      image: variant.images[0] || null,
    }));

    // Group attributes for selector
    const attributeGroups = product.attributes.map((pa) => ({
      name: pa.attribute.name,
      displayName: pa.attribute.displayName,
      type: pa.attribute.type,
      values: pa.attribute.values.map((v) => ({
        value: v.value,
        displayValue: v.displayValue || v.value,
        colorHex: v.colorHex,
      })),
    }));

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      description: product.description,
      brand: product.brand,
      basePrice: Number(product.basePrice),
      baseCost: Number(product.baseCost),
      discountPercent: Number(product.discountPercent),
      finalPrice: this.calculateFinalPrice(product.basePrice, product.discountPercent),
      trackStock: product.trackStock,
      categories: product.categories.map((pc) => pc.category),
      images: product.images,
      variants: transformedVariants,
      attributes: attributeGroups,
    };
  }

  // Get related products
  async getRelatedProducts(productId: string, limit: number = 4) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: {
          select: {
            categoryId: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const categoryIds = product.categories.map((c) => c.categoryId);

    const relatedProducts = await this.prisma.product.findMany({
      where: {
        id: { not: productId },
        isActive: true,
        isDeleted: false,
        categories: {
          some: {
            categoryId: {
              in: categoryIds,
            },
          },
        },
      },
      include: {
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: {
            id: true,
            thumbnailUrl: true,
            smallUrl: true,
          },
        },
      },
      take: limit,
    });

    return relatedProducts.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      basePrice: Number(p.basePrice),
      discountPercent: Number(p.discountPercent),
      finalPrice: this.calculateFinalPrice(p.basePrice, p.discountPercent),
      images: p.images, // Return images array instead of primaryImage
    }));
  }

  // Get unique brands for filter
  async getBrands() {
    const brands = await this.prisma.product.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        brand: { not: null },
      },
      select: {
        brand: true,
      },
      distinct: ['brand'],
    });

    return brands
      .map((b) => b.brand)
      .filter((brand): brand is string => brand !== null)
      .sort();
  }

  // Helper: Calculate final price with discount
  private calculateFinalPrice(basePrice: Prisma.Decimal, discountPercent: Prisma.Decimal): number {
    const price = Number(basePrice);
    const discount = Number(discountPercent);
    return price - (price * discount) / 100;
  }
}
