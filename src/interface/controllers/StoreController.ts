import { Request, Response } from 'express';
import { StoreService } from '../../application/services/StoreService';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response';

export class StoreController {
  constructor(private storeService: StoreService) {}

  // Get store settings
  async getSettings(req: Request, res: Response) {
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
}
