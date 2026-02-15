import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response.js';

export class AdminAnalyticsController {
  constructor(private prisma: PrismaClient) {}

  async getDashboardStats(req: Request, res: Response) {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get orders in period
      const orders = await this.prisma.customerOrder.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        include: {
          items: true,
        },
      });

      // Total revenue
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);

      // Average order value
      const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      // Orders by status
      const ordersByStatus = await this.prisma.customerOrder.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: startDate },
        },
        _count: true,
      });

      // Low stock products - only variants with stock <= 5
      // For products with variants: only show those with low-stock variants
      // For products without variants: show if main stock <= 5
      const lowStockProducts = await this.prisma.product.findMany({
        where: {
          isDeleted: false,
          OR: [
            // Products without variants, with low stock
            {
              AND: [
                { variants: { none: {} } },
                { stock: { lte: 5 } },
              ],
            },
            // Products with variants that have low stock
            {
              variants: {
                some: {
                  stock: { lte: 5 },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          variants: {
            where: { stock: { lte: 5 } },
            select: {
              id: true,
              variantSku: true,
              stock: true,
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
        },
        take: 10,
      });
      // Out of stock products (variants with no stock)
      // Out of stock products - only variants with stock = 0
      // For products with variants: only count those with zero-stock variants
      // For products without variants: count if main stock = 0
      const outOfStockProducts = await this.prisma.product.findMany({
        where: {
          isDeleted: false,
          OR: [
            // Products without variants, with zero stock
            {
              AND: [
                { variants: { none: {} } },
                { stock: 0 },
              ],
            },
            // Products with variants that have zero stock
            {
              variants: {
                some: {
                  stock: 0,
                },
              },
            },
          ],
        },
        select: {
          id: true,
          stock: true,
          variants: {
            where: { stock: 0 },
            select: { id: true },
          },
        },
      });

      const outOfStockCount = outOfStockProducts.reduce((count, product) => {
        return product.stock === 0 ? count + 1 : count + product.variants.length;
      }, 0);

      sendSuccess(res, {
        totalOrders: orders.length,
        totalRevenue: Math.round(totalRevenue),
        avgOrderValue: Math.round(avgOrderValue),
        ordersByStatus,
        lowStockProducts,
        outOfStockCount,
      });
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener estadísticas', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getSalesOverTime(req: Request, res: Response) {
    try {
      const { period = 'week' } = req.query;
      
      let startDate = new Date();
      let groupBy: 'day' | 'week' | 'month' = 'day';

      switch (period) {
        case 'day':
          startDate.setHours(0, 0, 0, 0);
          groupBy = 'day';
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          groupBy = 'day';
          break;
        case 'month':
          startDate.setDate(startDate.getDate() - 30);
          groupBy = 'day';
          break;
        case 'year':
          startDate.setMonth(startDate.getMonth() - 12);
          groupBy = 'month';
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
          groupBy = 'day';
      }

      const orders = await this.prisma.customerOrder.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' },
        },
        select: {
          createdAt: true,
          total: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Group by date
      const salesByDate = new Map<string, { date: string; sales: number; orders: number }>();
      
      orders.forEach((order) => {
        let dateKey: string;
        if (groupBy === 'month') {
          dateKey = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
        } else {
          dateKey = order.createdAt.toISOString().split('T')[0];
        }

        if (!salesByDate.has(dateKey)) {
          salesByDate.set(dateKey, { date: dateKey, sales: 0, orders: 0 });
        }

        const entry = salesByDate.get(dateKey)!;
        entry.sales += Number(order.total);
        entry.orders += 1;
      });

      const result = Array.from(salesByDate.values()).map((entry) => ({
        date: entry.date,
        sales: Math.round(entry.sales),
        orders: entry.orders,
      }));

      sendSuccess(res, result);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener ventas', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getTopProducts(req: Request, res: Response) {
    try {
      const { limit = '10', period = '30' } = req.query;
      const days = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const topProducts = await this.prisma.customerOrderItem.groupBy({
        by: ['productName'],
        where: {
          order: {
            createdAt: { gte: startDate },
            status: { not: 'CANCELLED' },
          },
        },
        _sum: {
          quantity: true,
          totalPrice: true,
        },
        orderBy: {
          _sum: {
            totalPrice: 'desc',
          },
        },
        take: parseInt(limit as string),
      });

      const result = topProducts.map((item) => ({
        name: item.productName,
        quantity: item._sum.quantity || 0,
        revenue: Math.round(Number(item._sum.totalPrice) || 0),
      }));

      sendSuccess(res, result);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener productos más vendidos', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getSalesByCategory(req: Request, res: Response) {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get all orders with items
      const orders = await this.prisma.customerOrder.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' },
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      categories: {
                        include: {
                          category: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Aggregate by category
      const categoryMap = new Map<string, { name: string; revenue: number; quantity: number }>();

      orders.forEach((order) => {
        order.items.forEach((item) => {
          const categories = item.variant?.product?.categories;
          if (categories) {
            categories.forEach((pc) => {
              const categoryName = pc.category.name;
              if (!categoryMap.has(categoryName)) {
                categoryMap.set(categoryName, { name: categoryName, revenue: 0, quantity: 0 });
              }
              const entry = categoryMap.get(categoryName)!;
              entry.revenue += Number(item.totalPrice);
              entry.quantity += item.quantity;
            });
          }
        });
      });

      const result = Array.from(categoryMap.values())
        .map((entry) => ({
          ...entry,
          revenue: Math.round(entry.revenue),
        }))
        .sort((a, b) => b.revenue - a.revenue);

      sendSuccess(res, result);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener ventas por categoría', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
