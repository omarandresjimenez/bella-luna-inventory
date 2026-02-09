import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { createProductSchema, updateProductSchema, createVariantSchema } from '../../application/dtos/product.dto';
import { supabase, STORAGE_BUCKET, generateImageUrls } from '../../config/supabase';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class AdminProductController {
  // Create product
  async createProduct(req: Request, res: Response) {
    try {
      const data = createProductSchema.parse(req.body);

      const product = await prisma.product.create({
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

      return res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Error al crear producto',
        },
      });
    }
  }

  // Update product
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateProductSchema.parse(req.body);

      const updateData: any = { ...data };
      
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

      const product = await prisma.product.update({
        where: { id },
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

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Error al actualizar producto',
        },
      });
    }
  }

  // Soft delete product
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.product.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          isActive: false,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Producto eliminado correctamente',
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Error al eliminar producto',
        },
      });
    }
  }

  // Create variant
  async createVariant(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const data = createVariantSchema.parse(req.body);

      const variant = await prisma.productVariant.create({
        data: {
          productId,
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

      return res.status(201).json({
        success: true,
        data: variant,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Error al crear variante',
        },
      });
    }
  }

  // Update variant
  async updateVariant(req: Request, res: Response) {
    try {
      const { variantId } = req.params;
      const data = createVariantSchema.partial().parse(req.body);

      const updateData: any = { ...data };
      
      if (data.attributeValueIds) {
        updateData.attributeValues = {
          deleteMany: {},
          create: data.attributeValueIds.map((attributeValueId) => ({
            attributeValue: { connect: { id: attributeValueId } },
          })),
        };
        delete updateData.attributeValueIds;
      }

      const variant = await prisma.productVariant.update({
        where: { id: variantId },
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

      return res.status(200).json({
        success: true,
        data: variant,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Error al actualizar variante',
        },
      });
    }
  }

  // Upload product images
  async uploadImages(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const files = req.files as Express.Multer.File[];
      const { variantId, isPrimary } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'No se proporcionaron imágenes' },
        });
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
          console.error('Error uploading image:', uploadError);
          continue;
        }

        // Generate URLs for different sizes
        const urls = generateImageUrls(fileName);

        // Save to database
        const image = await prisma.productImage.create({
          data: {
            productId,
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

      return res.status(201).json({
        success: true,
        data: uploadedImages,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error al subir imágenes',
        },
      });
    }
  }

  // Delete image
  async deleteImage(req: Request, res: Response) {
    try {
      const { productId, imageId } = req.params;

      const image = await prisma.productImage.findFirst({
        where: { id: imageId, productId },
      });

      if (!image) {
        return res.status(404).json({
          success: false,
          error: { message: 'Imagen no encontrada' },
        });
      }

      // Delete from Supabase
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([image.originalPath]);

      if (error) {
        console.error('Error deleting from storage:', error);
      }

      // Delete from database
      await prisma.productImage.delete({
        where: { id: imageId },
      });

      return res.status(200).json({
        success: true,
        message: 'Imagen eliminada',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error al eliminar imagen',
        },
      });
    }
  }

  // Get all products (admin view)
  async getAllProducts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          include: {
            categories: {
              include: { category: true },
            },
            variants: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.product.count(),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          products,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error al obtener productos',
        },
      });
    }
  }
}
