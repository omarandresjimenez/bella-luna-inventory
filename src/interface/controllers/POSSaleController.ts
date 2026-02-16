import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { POSSaleService } from '../../application/services/POSSaleService.js';
import { createPOSSaleSchema, posSaleFilterSchema } from '../../application/dtos/pos-sale.dto.js';

export class POSSaleController {
  private posSaleService: POSSaleService;

  constructor(prisma: PrismaClient) {
    this.posSaleService = new POSSaleService(prisma);
  }

  /**
   * POST /admin/pos/sales - Create a new POS sale
   */
  async createSale(req: Request, res: Response): Promise<void> {
    try {
      const staffId = (req as any).user?.userId;
      if (!staffId) {
        res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Staff ID not found in request',
        });
        return;
      }

      // Validate request body
      const validated = createPOSSaleSchema.parse(req.body);

      // Create sale
      const sale = await this.posSaleService.createSale(staffId, validated);

      res.status(201).json({
        success: true,
        data: sale,
        message: 'Sale created successfully',
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.errors[0].message,
        });
      } else if (error.message.includes('Insufficient stock')) {
        res.status(400).json({
          success: false,
          error: 'INSUFFICIENT_STOCK',
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'SALE_CREATION_FAILED',
          message: error.message,
        });
      }
    }
  }

  /**
   * GET /admin/pos/sales - Get POS sales with pagination and filters
   */
  async getSales(req: Request, res: Response): Promise<void> {
    try {
      const filters = posSaleFilterSchema.parse(req.query);
      const result = await this.posSaleService.getSales(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.errors[0].message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'FETCH_SALES_FAILED',
          message: error.message,
        });
      }
    }
  }

  /**
   * GET /admin/pos/sales/:id - Get single POS sale
   */
  async getSaleById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const sale = await this.posSaleService.getSaleById(id);

      res.json({
        success: true,
        data: sale,
      });
    } catch (error: any) {
      if (error.message === 'POS Sale not found') {
        res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'FETCH_SALE_FAILED',
          message: error.message,
        });
      }
    }
  }

  /**
   * POST /admin/pos/sales/:id/void - Void a POS sale
   */
  async voidSale(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const sale = await this.posSaleService.voidSale(id);

      res.json({
        success: true,
        data: sale,
        message: 'Sale voided successfully',
      });
    } catch (error: any) {
      if (error.message === 'POS Sale not found') {
        res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: error.message,
        });
      } else if (error.message.includes('already voided')) {
        res.status(400).json({
          success: false,
          error: 'INVALID_STATE',
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'VOID_SALE_FAILED',
          message: error.message,
        });
      }
    }
  }

  /**
   * GET /admin/pos/summary - Get POS sales statistics
   */
  async getSalesSummary(req: Request, res: Response): Promise<void> {
    try {
      const periodStr = Array.isArray(req.query.period) ? req.query.period[0] as string : req.query.period as string;
      const period = periodStr ? parseInt(periodStr) : 30;

      const stats = await this.posSaleService.getSalesStats(period);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'SUMMARY_FETCH_FAILED',
        message: error.message,
      });
    }
  }

  /**
   * GET /admin/pos/sales-over-time - Get POS sales over time
   */
  async getSalesOverTime(req: Request, res: Response): Promise<void> {
    try {
      const periodStr = Array.isArray(req.query.period) ? req.query.period[0] as string : req.query.period as string;
      const period = (periodStr || 'week') as 'week' | 'month' | 'year';

      const data = await this.posSaleService.getSalesOverTime(period);

      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'SALES_OVER_TIME_FETCH_FAILED',
        message: error.message,
      });
    }
  }

  /**
   * GET /admin/pos/top-products - Get top products by POS sales
   */
  async getTopProducts(req: Request, res: Response): Promise<void> {
    try {
      const limitStr = Array.isArray(req.query.limit) ? req.query.limit[0] as string : req.query.limit as string;
      const periodStr = Array.isArray(req.query.period) ? req.query.period[0] as string : req.query.period as string;
      const limit = limitStr ? parseInt(limitStr) : 10;
      const period = periodStr ? parseInt(periodStr) : 30;

      const products = await this.posSaleService.getTopPOSProducts(limit, period);

      res.json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'TOP_PRODUCTS_FETCH_FAILED',
        message: error.message,
      });
    }
  }

  /**
   * GET /admin/pos/sales-by-staff - Get sales by salesman
   */
  async getSalesByStaff(req: Request, res: Response): Promise<void> {
    try {
      const periodStr = Array.isArray(req.query.period) ? req.query.period[0] as string : req.query.period as string;
      const period = periodStr ? parseInt(periodStr) : 30;

      const staff = await this.posSaleService.getSalesByStaff(period);

      res.json({
        success: true,
        data: staff,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'SALES_BY_STAFF_FETCH_FAILED',
        message: error.message,
      });
    }
  }

  /**
   * GET /admin/pos/export - Export sales to CSV
   */
  async exportSales(req: Request, res: Response): Promise<void> {
    try {
      const periodStr = Array.isArray(req.query.period) ? req.query.period[0] as string : req.query.period as string;
      const period = periodStr ? parseInt(periodStr) : 30;

      const sales = await this.posSaleService.getAllCompletedSales(period);

      // Convert to CSV format
      const headers = ['Sale Number', 'Salesman', 'Subtotal', 'Total', 'Payment Type', 'Status', 'Date', 'Product Name', 'Variant', 'Quantity', 'Unit Price', 'Total Price'];
      const rows: string[] = [];

      sales.forEach((sale: any) => {
        if (sale.items.length === 0) {
          rows.push([
            sale.saleNumber,
            sale.staffId,
            Number(sale.subtotal),
            Number(sale.total),
            sale.paymentType,
            sale.status,
            new Date(sale.createdAt).toISOString(),
            '',
            '',
            '',
            '',
            '',
          ].map(field => `"${field}"`).join(','));
        } else {
          sale.items.forEach((item: any, index: number) => {
            rows.push([
              index === 0 ? sale.saleNumber : '',
              index === 0 ? sale.staffId : '',
              index === 0 ? Number(sale.subtotal) : '',
              index === 0 ? Number(sale.total) : '',
              index === 0 ? sale.paymentType : '',
              index === 0 ? sale.status : '',
              index === 0 ? new Date(sale.createdAt).toISOString() : '',
              item.productName,
              item.variantName,
              item.quantity,
              Number(item.unitPrice),
              Number(item.totalPrice),
            ].map(field => `"${field}"`).join(','));
          });
        }
      });

      const csv = [headers.join(','), ...rows].join('\n');
      const timestamp = new Date().toISOString().split('T')[0];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="pos-sales-${timestamp}.csv"`);
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'EXPORT_FAILED',
        message: error.message,
      });
    }
  }
}
