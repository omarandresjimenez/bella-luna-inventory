import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createProductSchema, updateProductSchema, createVariantSchema } from '../../application/dtos/product.dto.js';
import { supabase, STORAGE_BUCKET, generateImageUrls } from '../../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response.js';

// Helper to convert Decimal fields to numbers for JSON serialization
const convertProductToJSON = (product: any) => ({
  ...product,
  baseCost: Number(product.baseCost),
  basePrice: Number(product.basePrice),
  discountPercent: Number(product.discountPercent),
  variants: product.variants?.map((v: any) => ({
    ...v,
    cost: v.cost ? Number(v.cost) : null,
    price: v.price ? Number(v.price) : null,
  })),
});

export class AdminProductController {
  constructor(private prisma: PrismaClient) {}

  // Create product
  async createProduct(req: Request, res: Response) {
    try {
      const data = createProductSchema.parse(req.body);

      const product = await this.prisma.product.create({
        data: {
          sku: data.sku,
          name: data.name,
          description: data.description,
          brand: data.brand,
          slug: data.slug,
          baseCost: data.baseCost,
          basePrice: data.basePrice,
          discountPercent: data.discountPercent,
          trackStock: data.trackStock,
          stock: data.stock,  // Stock for products without variants
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          categories: {
            create: data.categoryIds.map((categoryId) => ({
              category: { connect: { id: categoryId } },
            })),
          },
          attributes: {
            create: (data.attributes || []).map((attr) => ({
              attribute: { connect: { id: attr.attributeId } },
              value: attr.value || null,
            })),
          },
        },
        include: {
          categories: {
            include: { category: true },
          },
          variants: {
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
              images: true,
            },
          },
          images: {
            orderBy: { isPrimary: 'desc' },
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

      sendSuccess(res, convertProductToJSON(product), HttpStatus.CREATED);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al crear producto', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Update product
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateProductSchema.parse(req.body);

      const updateData: Record<string, unknown> = { ...data };

      // Handle categories update
      if (data.categoryIds) {
        updateData.categories = {
          deleteMany: {},
          create: data.categoryIds.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        };
        delete updateData.categoryIds;
      }

      // Handle attributes update (with values)
      if (data.attributes) {
        updateData.attributes = {
          deleteMany: {},
          create: data.attributes.map((attr) => ({
            attribute: { connect: { id: attr.attributeId } },
            value: attr.value || null,
          })),
        };
      } else if (data.attributeIds) {
        // Fallback for backward compatibility
        updateData.attributes = {
          deleteMany: {},
          create: data.attributeIds.map((attributeId) => ({
            attribute: { connect: { id: attributeId } },
          })),
        };
        delete updateData.attributeIds;
      }

      const product = await this.prisma.product.update({
        where: { id: String(id) },
        data: updateData,
        include: {
          categories: {
            include: { category: true },
          },
          variants: {
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
              images: true,
            },
          },
          images: {
            orderBy: { isPrimary: 'desc' },
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

      console.log('[AdminProductController] Updated product:', {
        id: product.id,
        attributeCount: product.attributes?.length ?? 0,
      });

      const converted = convertProductToJSON(product);
      console.log('[AdminProductController] After conversion:', {
        id: converted.id,
        attributeCount: converted.attributes?.length ?? 0,
      });

      sendSuccess(res, converted);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al actualizar producto', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Soft delete product
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await this.prisma.product.update({
        where: { id: String(id) },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          isActive: false,
        },
      });

      sendSuccess(res, { message: 'Producto eliminado correctamente' });
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al eliminar producto', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Create variant
  async createVariant(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const data = createVariantSchema.parse(req.body);

      const variant = await this.prisma.productVariant.create({
        data: {
          productId: String(productId),
          variantSku: data.variantSku,
          cost: data.cost,
          price: data.price,
          stock: data.stock,
          isActive: data.isActive,
          attributeValues: {
            create: data.attributeValueIds.map((attributeValueId) => ({
              attributeValue: { connect: { id: attributeValueId } },
            })),
          },
        },
        include: {
          attributeValues: {
            include: {
              attributeValue: {
                include: { attribute: true },
              },
            },
          },
        },
      });

      const variantData = {
        ...variant,
        cost: variant.cost ? Number(variant.cost) : null,
        price: variant.price ? Number(variant.price) : null,
      };

      sendSuccess(res, variantData, HttpStatus.CREATED);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al crear variante', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Update variant
  async updateVariant(req: Request, res: Response) {
    try {
      const { variantId } = req.params;
      const data = createVariantSchema.partial().parse(req.body);

      const updateData: Record<string, unknown> = { ...data };

      if (data.attributeValueIds) {
        updateData.attributeValues = {
          deleteMany: {},
          create: data.attributeValueIds.map((attributeValueId) => ({
            attributeValue: { connect: { id: attributeValueId } },
          })),
        };
        delete updateData.attributeValueIds;
      }

      const variant = await this.prisma.productVariant.update({
        where: { id: String(variantId) },
        data: updateData,
        include: {
          attributeValues: {
            include: {
              attributeValue: {
                include: { attribute: true },
              },
            },
          },
        },
      });

      const variantData = {
        ...variant,
        cost: variant.cost ? Number(variant.cost) : null,
        price: variant.price ? Number(variant.price) : null,
      };

      sendSuccess(res, variantData);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al actualizar variante', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get product variants
  async getProductVariants(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      const variants = await this.prisma.productVariant.findMany({
        where: { productId: String(productId) },
        include: {
          attributeValues: {
            include: {
              attributeValue: {
                include: { attribute: true },
              },
            },
          },
        },
      });

      const variantsData = variants.map(v => ({
        ...v,
        cost: v.cost ? Number(v.cost) : null,
        price: v.price ? Number(v.price) : null,
      }));

      sendSuccess(res, variantsData);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener variantes', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Delete variant
  async deleteVariant(req: Request, res: Response) {
    try {
      const { variantId } = req.params;

      await this.prisma.productVariant.delete({
        where: { id: String(variantId) },
      });

      sendSuccess(res, { message: 'Variante eliminada correctamente' });
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al eliminar variante', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Generate all variant combinations
  async generateVariants(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { attributeValueIds, defaultPrice, defaultStock } = req.body;

      if (!Array.isArray(attributeValueIds) || attributeValueIds.length === 0) {
        sendError(res, ErrorCode.BAD_REQUEST, 'Debe proporcionar al menos un valor de atributo', HttpStatus.BAD_REQUEST);
        return;
      }

      // Get all attribute values with their attributes
      const attributeValues = await this.prisma.attributeValue.findMany({
        where: { id: { in: attributeValueIds } },
        include: { attribute: true },
      });

      // Group by attribute
      const groupedByAttribute: Record<string, typeof attributeValues> = {};
      attributeValues.forEach((av) => {
        if (!groupedByAttribute[av.attributeId]) {
          groupedByAttribute[av.attributeId] = [];
        }
        groupedByAttribute[av.attributeId].push(av);
      });

      // Generate all combinations
      const attributes = Object.keys(groupedByAttribute);
      const combinations: string[][] = [];

      const generateCombinations = (current: string[], index: number) => {
        if (index === attributes.length) {
          combinations.push([...current]);
          return;
        }

        const attrId = attributes[index];
        for (const value of groupedByAttribute[attrId]) {
          current.push(value.id);
          generateCombinations(current, index + 1);
          current.pop();
        }
      };

      generateCombinations([], 0);

      // Get existing variants to avoid duplicates
      const existingVariants = await this.prisma.productVariant.findMany({
        where: { productId: String(productId) },
        include: { attributeValues: true },
      });

      // Filter out existing combinations
      const newCombinations = combinations.filter((combo) => {
        return !existingVariants.some((variant) => {
          const variantValueIds = variant.attributeValues.map((vav) => vav.attributeValueId);
          return (
            variantValueIds.length === combo.length &&
            variantValueIds.every((id) => combo.includes(id))
          );
        });
      });

      // Create new variants
      const createdVariants = [];
      for (const combo of newCombinations) {
        const variant = await this.prisma.productVariant.create({
          data: {
            productId: String(productId),
            price: defaultPrice ? Number(defaultPrice) : null,
            stock: defaultStock ? Number(defaultStock) : 0,
            isActive: true,
            attributeValues: {
              create: combo.map((attributeValueId) => ({
                attributeValue: { connect: { id: attributeValueId } },
              })),
            },
          },
          include: {
            attributeValues: {
              include: {
                attributeValue: {
                  include: { attribute: true },
                },
              },
            },
          },
        });
        createdVariants.push({
          ...variant,
          cost: variant.cost ? Number(variant.cost) : null,
          price: variant.price ? Number(variant.price) : null,
        });
      }

      sendSuccess(res, {
        message: `${createdVariants.length} variantes creadas exitosamente`,
        created: createdVariants,
        skipped: combinations.length - newCombinations.length,
      });
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al generar variantes', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Upload product images
  async uploadImages(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const files = req.files as Express.Multer.File[];
      const { variantId, isPrimary } = req.body;

      if (!files || files.length === 0) {
        sendError(res, ErrorCode.BAD_REQUEST, 'No se proporcionaron imÃ¡genes', HttpStatus.BAD_REQUEST);
        return;
      }

      const uploadedImages = [];

      for (const file of files) {
        const fileName = `${productId}/${uuidv4()}.${file.originalname.split('.').pop()}`;

        // Upload to Supabase
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (uploadError) {

          continue;
        }

        // Generate URLs for different sizes
        const urls = generateImageUrls(fileName);

        // Save to database
        const image = await this.prisma.productImage.create({
          data: {
            productId: String(productId),
            variantId: variantId || null,
            originalPath: fileName,
            thumbnailUrl: urls.thumbnail,
            smallUrl: urls.small,
            mediumUrl: urls.medium,
            largeUrl: urls.large,
            isPrimary: isPrimary === 'true' || files.indexOf(file) === 0,
          },
        });

        uploadedImages.push(image);
      }

      sendSuccess(res, uploadedImages, HttpStatus.CREATED);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al subir imÃ¡genes', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Delete image
  async deleteImage(req: Request, res: Response) {
    try {
      const { productId, imageId } = req.params;

      const image = await this.prisma.productImage.findFirst({
        where: { id: String(imageId), productId: String(productId) },
      });

      if (!image) {
        sendError(res, ErrorCode.NOT_FOUND, 'Imagen no encontrada', HttpStatus.NOT_FOUND);
        return;
      }

      // Delete from Supabase
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([image.originalPath]);

      if (error) {

      }

      // Delete from database
      await this.prisma.productImage.delete({
        where: { id: String(imageId) },
      });

      sendSuccess(res, { message: 'Imagen eliminada' });
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al eliminar imagen', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Set primary image
  async setPrimaryImage(req: Request, res: Response) {
    try {
      const { productId, imageId } = req.params;

      // Verify image exists and belongs to product
      const image = await this.prisma.productImage.findFirst({
        where: { id: String(imageId), productId: String(productId) },
      });

      if (!image) {
        sendError(res, ErrorCode.NOT_FOUND, 'Imagen no encontrada', HttpStatus.NOT_FOUND);
        return;
      }

      // Set all images for this product to non-primary
      await this.prisma.productImage.updateMany({
        where: { productId: String(productId) },
        data: { isPrimary: false },
      });

      // Set the selected image as primary
      await this.prisma.productImage.update({
        where: { id: String(imageId) },
        data: { isPrimary: true },
      });

      sendSuccess(res, { message: 'Imagen principal actualizada' });
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al establecer imagen principal', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get product by ID (admin view)
  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string') {
        sendError(res, ErrorCode.BAD_REQUEST, 'ID de producto inválido', HttpStatus.BAD_REQUEST);
        return;
      }

      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          categories: {
            include: { category: true },
          },
          variants: {
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
              images: true,
            },
          },
          images: {
            orderBy: { isPrimary: 'desc' },
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
        sendError(res, ErrorCode.NOT_FOUND, 'Producto no encontrado', HttpStatus.NOT_FOUND);
        return;
      }

      sendSuccess(res, convertProductToJSON(product));
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener producto', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Update product attributes only
  async updateProductAttributes(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { attributes } = req.body;

      if (!Array.isArray(attributes)) {
        sendError(res, ErrorCode.BAD_REQUEST, 'Atributos inválidos', HttpStatus.BAD_REQUEST);
        return;
      }

      // Delete existing attributes and create new ones
      await this.prisma.productAttribute.deleteMany({
        where: { productId: String(productId) },
      });

      // Create new attributes with values
      if (attributes.length > 0) {
        await this.prisma.productAttribute.createMany({
          data: attributes.map((attr: { attributeId: string; value?: string }) => ({
            productId: String(productId),
            attributeId: attr.attributeId,
            value: attr.value || null,
          })),
        });
      }

      // Return updated product
      const product = await this.prisma.product.findUnique({
        where: { id: String(productId) },
        include: {
          attributes: {
            include: { attribute: true },
          },
        },
      });

      sendSuccess(res, product);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al actualizar atributos', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get all products (admin view)
  async getAllProducts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const skip = (page - 1) * limit;

      const products = await this.prisma.product.findMany({
        include: {
          categories: {
            include: { category: true },
          },
          variants: true,
          images: {
            orderBy: { isPrimary: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      sendSuccess(res, products);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener productos', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Export products as CSV
  async exportProductsCSV(req: Request, res: Response) {
    try {
      // Get all products with all related data
      const products = await this.prisma.product.findMany({
        where: { isDeleted: false },
        include: {
          categories: {
            include: { category: true },
          },
          variants: {
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
              images: true,
            },
          },
          images: {
            orderBy: { isPrimary: 'desc' },
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
        orderBy: { createdAt: 'desc' },
      });

      // Collect all unique attribute names used across all variants
      const attributeNames: string[] = [];
      const attributeNameSet = new Set<string>();

      products.forEach((product) => {
        product.variants.forEach((variant) => {
          variant.attributeValues.forEach((av) => {
            const attrName = av.attributeValue.attribute.displayName || av.attributeValue.attribute.name;
            if (!attributeNameSet.has(attrName)) {
              attributeNameSet.add(attrName);
              attributeNames.push(attrName);
            }
          });
        });
      });

      // Find max number of variants across all products (for dynamic columns)
      const maxVariants = Math.max(...products.map((p) => p.variants.length), 0);

      // Build header row
      // Product basic info
      const headers: string[] = [
        'ID',
        'SKU',
        'Nombre',
        'Slug',
        'Descripción',
        'Marca',
        'Precio Base',
        'Costo Base',
        'Descuento %',
        'Precio Final',
        'Categorías',
        'Activo',
        'Destacado',
        'Tracking Stock',
        'Stock (Producto)',
        'Tiene Variantes',
        'Atributos del Producto',
        'Imagen Principal',
        'Imágenes',
        'Fecha Creación',
      ];

      // Variant columns — one group per variant
      for (let i = 0; i < maxVariants; i++) {
        const n = i + 1;
        headers.push(
          `Variante ${n} - SKU`,
          `Variante ${n} - Precio`,
          `Variante ${n} - Costo`,
          `Variante ${n} - Stock`,
          `Variante ${n} - Activa`,
        );
        // One column per attribute for this variant
        attributeNames.forEach((attrName) => {
          headers.push(`Variante ${n} - ${attrName}`);
        });
      }

      // Build data rows — one row per product
      const rows = products.map((product) => {
        const discountPercent = Number(product.discountPercent);
        const basePrice = Number(product.basePrice);
        const finalPrice = discountPercent > 0
          ? Math.round(basePrice * (1 - discountPercent / 100))
          : basePrice;

        // Product attributes (non-variant, product-level)
        const productAttributes = product.attributes
          .map((pa) => `${pa.attribute.displayName || pa.attribute.name}: ${pa.value || ''}`)
          .join('; ');

        const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
        const allImageUrls = product.images.map((img) => img.mediumUrl).join(' | ');

        const row: (string | number)[] = [
          product.id,
          product.sku,
          product.name,
          product.slug,
          product.description || '',
          product.brand || '',
          basePrice,
          Number(product.baseCost),
          discountPercent,
          finalPrice,
          product.categories.map((c) => c.category.name).join('; '),
          product.isActive ? 'Sí' : 'No',
          product.isFeatured ? 'Sí' : 'No',
          product.trackStock ? 'Sí' : 'No',
          product.stock,
          product.variants.length > 0 ? 'Sí' : 'No',
          productAttributes,
          primaryImage?.mediumUrl || '',
          allImageUrls,
          product.createdAt.toISOString().split('T')[0],
        ];

        // Fill variant columns
        for (let i = 0; i < maxVariants; i++) {
          const variant = product.variants[i];
          if (variant) {
            row.push(
              variant.variantSku || '',
              variant.price != null ? Number(variant.price) : '',
              variant.cost != null ? Number(variant.cost) : '',
              variant.stock,
              variant.isActive ? 'Sí' : 'No',
            );
            // Attribute values for this variant
            attributeNames.forEach((attrName) => {
              const av = variant.attributeValues.find(
                (v) =>
                  (v.attributeValue.attribute.displayName || v.attributeValue.attribute.name) === attrName
              );
              row.push(av ? (av.attributeValue.displayValue || av.attributeValue.value) : '');
            });
          } else {
            // Empty cells for products with fewer variants
            row.push('', '', '', '', '');
            attributeNames.forEach(() => row.push(''));
          }
        }

        return row;
      });

      // Convert to CSV format
      const escapeCSV = (value: any): string => {
        if (value === null || value === undefined || value === '') return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes(';')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const csvContent = [
        headers.map(escapeCSV).join(','),
        ...rows.map((row) => row.map(escapeCSV).join(',')),
      ].join('\n');

      // Add BOM for proper UTF-8 encoding in Excel
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csvContent;

      // Set response headers for CSV download
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="productos.csv"');
      res.setHeader('Cache-Control', 'no-cache');

      res.send(csvWithBOM);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al exportar productos', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}

