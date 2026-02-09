import { Request, Response } from 'express';
import { StoreService } from '../../application/services/StoreService';

const storeService = new StoreService();

export class StoreController {
  // Get store settings
  async getSettings(req: Request, res: Response) {
    try {
      const settings = await storeService.getSettings();

      return res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error al obtener configuración',
        },
      });
    }
  }
}
