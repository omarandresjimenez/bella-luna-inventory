import { Response } from 'express';
import { AttributeAdminService } from '../../application/services/AttributeAdminService.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response.js';
import { z } from 'zod';

// Validation schemas
const createAttributeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').regex(/^[a-zA-Z0-9_]+$/, 'Nombre debe contener solo letras, nÃºmeros y guiones bajos'),
  displayName: z.string().min(1, 'El nombre de visualizaciÃ³n es requerido'),
  type: z.enum(['TEXT', 'COLOR_HEX', 'NUMBER']),
  sortOrder: z.number().int().optional()
});

const updateAttributeSchema = z.object({
  name: z.string().min(1).regex(/^[a-zA-Z0-9_]+$/).optional(),
  displayName: z.string().min(1).optional(),
  type: z.enum(['TEXT', 'COLOR_HEX', 'NUMBER']).optional(),
  sortOrder: z.number().int().optional()
});

const createAttributeValueSchema = z.object({
  value: z.string().min(1, 'El valor es requerido'),
  displayValue: z.string().optional(),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  sortOrder: z.number().int().optional()
});

export class AdminAttributeController {
  constructor(private attributeService: AttributeAdminService) {}

  // Get all attributes
  async getAllAttributes(req: AuthRequest, res: Response) {
    try {
      const attributes = await this.attributeService.getAllAttributes();
      sendSuccess(res, attributes);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener atributos', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get attribute by ID
  async getAttributeById(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const attribute = await this.attributeService.getAttributeById(id);
      
      if (!attribute) {
        sendError(res, ErrorCode.NOT_FOUND, 'Atributo no encontrado', HttpStatus.NOT_FOUND);
        return;
      }
      
      sendSuccess(res, attribute);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener atributo', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Create attribute
  async createAttribute(req: AuthRequest, res: Response) {
    try {
      const data = createAttributeSchema.parse(req.body);
      const attribute = await this.attributeService.createAttribute(data);
      sendSuccess(res, attribute, HttpStatus.CREATED);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, ErrorCode.VALIDATION_ERROR, error.errors[0].message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al crear atributo', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Update attribute
  async updateAttribute(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const data = updateAttributeSchema.parse(req.body);
      const attribute = await this.attributeService.updateAttribute(id, data);
      sendSuccess(res, attribute);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, ErrorCode.VALIDATION_ERROR, error.errors[0].message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof Error) {
        if (error.message === 'Atributo no encontrado') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al actualizar atributo', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Delete attribute
  async deleteAttribute(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      await this.attributeService.deleteAttribute(id);
      sendSuccess(res, { message: 'Atributo eliminado correctamente' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Atributo no encontrado') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al eliminar atributo', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Add value to attribute
  async addAttributeValue(req: AuthRequest, res: Response) {
    try {
      const attributeId = req.params.id as string;
      const data = createAttributeValueSchema.parse(req.body);
      const value = await this.attributeService.addAttributeValue(attributeId, data);
      sendSuccess(res, value, HttpStatus.CREATED);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, ErrorCode.VALIDATION_ERROR, error.errors[0].message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof Error) {
        if (error.message === 'Atributo no encontrado') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al agregar valor', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Remove value from attribute
  async removeAttributeValue(req: AuthRequest, res: Response) {
    try {
      const valueId = req.params.valueId as string;
      await this.attributeService.removeAttributeValue(valueId);
      sendSuccess(res, { message: 'Valor eliminado correctamente' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Valor de atributo no encontrado') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al eliminar valor', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}

