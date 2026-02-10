import { Response } from 'express';
import { AddressService } from '../../application/services/AddressService';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response';

export class AddressController {
  constructor(private addressService: AddressService) {}

  // Get all addresses for logged-in customer
  async getAddresses(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user!.userId;
      const addresses = await this.addressService.getCustomerAddresses(customerId);
      sendSuccess(res, addresses);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener direcciones', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Create new address
  async createAddress(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user!.userId;
      const address = await this.addressService.createAddress(customerId, req.body);
      sendSuccess(res, address, HttpStatus.CREATED);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al crear dirección', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Update address
  async updateAddress(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user!.userId;
      const id = req.params.id as string;
      const address = await this.addressService.updateAddress(id, customerId, req.body);
      sendSuccess(res, address);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Dirección no encontrada') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al actualizar dirección', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Delete address
  async deleteAddress(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user!.userId;
      const id = req.params.id as string;
      await this.addressService.deleteAddress(id, customerId);
      sendSuccess(res, { message: 'Dirección eliminada' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Dirección no encontrada') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al eliminar dirección', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
