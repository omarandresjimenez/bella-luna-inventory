import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createProductSchema, updateProductSchema, createVariantSchema } from '../../application/dtos/product.dto';
import { supabase, STORAGE_BUCKET, generateImageUrls } from '../../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response';

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
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          categories: {
            create: data.categoryIds.map((categoryId) => ({
              category: { connect: { id: categoryId } },
            })),
          },
          attributes: {
            create: (data.attributeIds || []).map((attributeId) => ({
              attribute: { connect: { id: attributeId } },
            })),
          },
        },
        include: {
          categories: {
            include: { category: true },
          },
          attributes: {
            include: { attribute: true },
          },
        },
      });

      sendSuccess(res, product, HttpStatus.CREATED);
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

      // Handle attributes update
      if (data.attributeIds) {
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
          attributes: {
            include: { attribute: true },
          },
          variants: true,
          images: true,
        },
      });

      sendSuccess(res, product);
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

      sendSuccess(res, variant, HttpStatus.CREATED);
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

      sendSuccess(res, variant);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al actualizar variante', HttpStatus.INTERNAL_SERVER_ERROR);
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
        sendError(res, ErrorCode.BAD_REQUEST, 'No se proporcionaron imágenes', HttpStatus.BAD_REQUEST);
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
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al subir imágenes', HttpStatus.INTERNAL_SERVER_ERROR);
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
          variants: true,
          images: {
            orderBy: { isPrimary: 'desc' },
          },
          attributes: {
            include: { attribute: true },
          },
        },
      });

      if (!product) {
        sendError(res, ErrorCode.NOT_FOUND, 'Producto no encontrado', HttpStatus.NOT_FOUND);
        return;
      }

      sendSuccess(res, product);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener producto', HttpStatus.INTERNAL_SERVER_ERROR);
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
}
