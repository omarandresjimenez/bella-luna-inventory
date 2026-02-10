import { Response } from 'express';
import { StoreService } from '../../application/services/StoreService';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response';
import { z } from 'zod';

// Validation schema
const updateSettingsSchema = z.object({
  storeName: z.string().min(1).optional(),
  storeEmail: z.string().email().optional(),
  storePhone: z.string().optional(),
  storeAddress: z.string().optional(),
  currency: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  freeShippingThreshold: z.number().min(0).optional(),
  baseDeliveryFee: z.number().min(0).optional(),
  maintenanceMode: z.boolean().optional(),
  enableRegistration: z.boolean().optional()
});

export class AdminSettingsController {
  constructor(private storeService: StoreService) {}

  // Get store settings
  async getSettings(req: AuthRequest, res: Response) {
    try {
      const settings = await this.storeService.getSettings();
      sendSuccess(res, settings);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener configuración', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Update store settings
  async updateSettings(req: AuthRequest, res: Response) {
    try {
      const data = updateSettingsSchema.parse(req.body);
      const settings = await this.storeService.updateSettings(data);
      sendSuccess(res, settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, ErrorCode.VALIDATION_ERROR, error.errors[0].message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al actualizar configuración', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
