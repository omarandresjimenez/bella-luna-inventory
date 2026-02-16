import { PrismaClient } from '@prisma/client';
import { CreatePOSSaleDTO, POSSaleResponse, POSSaleListResponse, POSSaleFilterDTO } from '../dtos/pos-sale.dto.js';

interface POSSaleWithItems {
  id: string;
  saleNumber: string;
  staffId: string;
  subtotal: unknown;
  total: unknown;
  notes: string | null;
  status: string;
  paymentType: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    productName: string;
    variantName: string;
    productSku: string;
    imageUrl: string | null;
    quantity: number;
    unitPrice: unknown;
    totalPrice: unknown;
  }>;
}

export class POSSaleService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new POS sale with items and deduct stock
   */
  async createSale(staffId: string, createSaleDTO: CreatePOSSaleDTO): Promise<POSSaleResponse> {
    // Validate stock availability for all items
    for (const item of createSaleDTO.items) {
      if (item.variantId) {
        const variant = await this.prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (!variant || variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.productName} - ${item.variantName}`);
        }
      }
    }

    // Calculate totals
    const subtotal = createSaleDTO.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    // Generate sale number
    const saleNumber = await this.generateSaleNumber();

    // Create sale with items in a transaction
    const sale = await this.prisma.$transaction(async (tx) => {
      // Create sale
      const newSale = await tx.pOSSale.create({
        data: {
          saleNumber,
          staffId,
          subtotal: subtotal,
          total: subtotal,
          notes: createSaleDTO.notes || null,
          paymentType: createSaleDTO.paymentType,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          items: {
            create: createSaleDTO.items.map((item) => ({
              productName: item.productName,
              variantName: item.variantName,
              productSku: item.productSku,
              imageUrl: item.imageUrl || null,
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // Deduct stock for all items
      for (const item of createSaleDTO.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return newSale;
    });

    return this.transformToResponse(sale as unknown as POSSaleWithItems);
  }

  /**
   * Get POS sales with pagination and filters
   */
  async getSales(filters: POSSaleFilterDTO): Promise<POSSaleListResponse> {
    const { page, limit, status, paymentType, startDate, endDate } = filters;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (paymentType) where.paymentType = paymentType;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [sales, total] = await Promise.all([
      this.prisma.pOSSale.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.pOSSale.count({ where }),
    ]);

    return {
      sales: sales.map((sale) => this.transformToResponse(sale as unknown as POSSaleWithItems)),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  /**
   * Get single POS sale by ID or saleNumber
   */
  async getSaleById(saleId: string): Promise<POSSaleResponse> {
    const sale = await this.prisma.pOSSale.findFirst({
      where: {
        OR: [{ id: saleId }, { saleNumber: saleId }],
      },
      include: { items: true },
    });

    if (!sale) {
      throw new Error('POS Sale not found');
    }

    return this.transformToResponse(sale as unknown as POSSaleWithItems);
  }

  /**
   * Void a POS sale (refund stock, mark as voided)
   */
  async voidSale(saleId: string): Promise<POSSaleResponse> {
    const sale = await this.prisma.pOSSale.findUnique({
      where: { id: saleId },
      include: { items: true },
    });

    if (!sale) {
      throw new Error('POS Sale not found');
    }

    if (sale.status === 'VOIDED') {
      throw new Error('Sale is already voided');
    }

    // Refund stock in a transaction
    const voidedSale = await this.prisma.$transaction(async (tx) => {
      // Refund stock for all items
      for (const item of sale.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      // Mark sale as voided
      return tx.pOSSale.update({
        where: { id: saleId },
        data: { status: 'VOIDED' },
        include: { items: true },
      });
    });

    return this.transformToResponse(voidedSale as unknown as POSSaleWithItems);
  }

  /**
   * Get POS sales summary for dashboard/analytics
   */
  async getSalesSummary(startDate?: Date, endDate?: Date) {
    const where: any = { status: 'COMPLETED' };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const sales = await this.prisma.pOSSale.findMany({
      where,
      include: { items: true },
    });

    const totalRevenue = sales.reduce((sum: number, sale: any) => sum + Number(sale.total), 0);
    const totalSales = sales.length;
    const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalRevenue,
      totalSales,
      avgSaleValue,
      sales: sales.map((sale: any) => this.transformToResponse(sale as unknown as POSSaleWithItems)),
    };
  }

  /**
   * Get top products by POS sales
   */
  async getTopProductsByPOS(limit: number = 10, days: number = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await this.prisma.pOSSale.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      include: { items: true },
    });

    const productMap = new Map<
      string,
      { productName: string; productSku: string; quantity: number; revenue: number }
    >();

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const key = item.productSku;
        if (productMap.has(key)) {
          const existing = productMap.get(key)!;
          existing.quantity += item.quantity;
          existing.revenue += Number(item.totalPrice);
        } else {
          productMap.set(key, {
            productName: item.productName,
            productSku: key,
            quantity: item.quantity,
            revenue: Number(item.totalPrice),
          });
        }
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  /**
   * Get POS sales statistics for a period
   */
  async getSalesStats(days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get completed sales in period
    const sales = await this.prisma.pOSSale.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      include: { items: true },
    });

    // Calculate statistics
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const totalSales = sales.length;

    // Count by payment method
    const paymentMethods: Record<string, number> = {};
    sales.forEach((sale) => {
      const method = sale.paymentType || 'CASH';
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    return {
      totalRevenue: Math.round(totalRevenue),
      totalSales,
      paymentMethods,
    };
  }

  /**
   * Get POS sales over time
   */
  async getSalesOverTime(period: 'week' | 'month' | 'year' = 'week') {
    let startDate = new Date();
    let groupFormat: 'day' | 'month' = 'day';

    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        groupFormat = 'day';
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        groupFormat = 'day';
        break;
      case 'year':
        startDate.setMonth(startDate.getMonth() - 12);
        groupFormat = 'month';
        break;
    }

    const sales = await this.prisma.pOSSale.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group sales by date/month
    const groupedData: Record<string, { revenue: number; sales: number }> = {};

    sales.forEach((sale) => {
      const date = new Date(sale.createdAt);
      let key: string;

      if (groupFormat === 'day') {
        key = date.toISOString().split('T')[0];
      } else {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        key = `${year}-${month}`;
      }

      if (!groupedData[key]) {
        groupedData[key] = { revenue: 0, sales: 0 };
      }

      groupedData[key].revenue += Number(sale.total);
      groupedData[key].sales += 1;
    });

    return Object.entries(groupedData).map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue),
      sales: data.sales,
    }));
  }

  /**
   * Get top products sold via POS
   */
  async getTopPOSProducts(limit: number = 10, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const products = await this.prisma.pOSSaleItem.groupBy({
      by: ['productName', 'variantName', 'productSku'],
      where: {
        sale: {
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      _avg: {
        unitPrice: true,
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc',
        },
      },
      take: limit,
    });

    return products.map((product) => ({
      productName: product.productName,
      variantName: product.variantName,
      productSku: product.productSku,
      totalQuantity: product._sum.quantity || 0,
      totalRevenue: Math.round(Number(product._sum.totalPrice) || 0),
      avgPrice: Math.round(Number(product._avg.unitPrice) || 0),
    }));
  }

  /**
   * Helper: Generate unique sale number
   */
  private async generateSaleNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // Get count of sales today
    const startOfDay = new Date(year, today.getMonth(), today.getDate());
    const endOfDay = new Date(year, today.getMonth(), today.getDate() + 1);

    const count = await this.prisma.pOSSale.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    return `POS-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * Get sales by salesman for a period
   */
  async getSalesByStaff(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await this.prisma.pOSSale.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      select: {
        staffId: true,
        total: true,
      },
    });

    // Get unique staff IDs
    const staffIds = [...new Set(sales.map(s => s.staffId))];
    
    // Fetch staff details
    const staffMembers = await this.prisma.user.findMany({
      where: {
        id: { in: staffIds },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    // Create staff map
    const staffMap = new Map(staffMembers.map(s => [s.id, `${s.firstName} ${s.lastName}`]));

    // Group by staffId
    const resultMap = new Map<string, { staffId: string; staffName: string; totalRevenue: number; salesCount: number }>();

    sales.forEach((sale) => {
      const staffName = staffMap.get(sale.staffId) || sale.staffId;
      const key = sale.staffId;
      
      if (resultMap.has(key)) {
        const existing = resultMap.get(key)!;
        existing.totalRevenue += Number(sale.total);
        existing.salesCount += 1;
      } else {
        resultMap.set(key, {
          staffId: key,
          staffName,
          totalRevenue: Number(sale.total),
          salesCount: 1,
        });
      }
    });

    return Array.from(resultMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  /**
   * Get all completed sales for export
   */
  async getAllCompletedSales(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.prisma.pOSSale.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Helper: Transform to response DTO
   */
  private transformToResponse(sale: POSSaleWithItems): POSSaleResponse {
    return {
      id: sale.id,
      saleNumber: sale.saleNumber,
      staffId: sale.staffId,
      subtotal: Number(sale.subtotal),
      total: Number(sale.total),
      notes: sale.notes,
      status: sale.status,
      paymentType: sale.paymentType,
      paymentStatus: sale.paymentStatus,
      items: sale.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        variantName: item.variantName,
        productSku: item.productSku,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    };
  }
}
