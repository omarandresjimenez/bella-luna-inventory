import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response.js';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth.middleware.js';

const prisma = new PrismaClient();

export class CustomerController {
  // Get customer profile
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const customerId = req.customerId;

      if (!customerId) {
        return sendError(res, ErrorCode.UNAUTHORIZED, 'No autorizado', HttpStatus.UNAUTHORIZED);
      }

      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
        },
      });

      if (!customer) {
        return sendError(res, ErrorCode.NOT_FOUND, 'Cliente no encontrado', HttpStatus.NOT_FOUND);
      }

      sendSuccess(res, customer);
    } catch (error) {
      sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener perfil', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Update customer profile
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const customerId = req.customerId;

      if (!customerId) {
        return sendError(res, ErrorCode.UNAUTHORIZED, 'No autorizado', HttpStatus.UNAUTHORIZED);
      }

      const { firstName, lastName, email, phone } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email) {
        return sendError(res, ErrorCode.BAD_REQUEST, 'Nombre, apellido y email son requeridos', HttpStatus.BAD_REQUEST);
      }

      // Check if email is already taken by another customer
      if (email) {
        const existingCustomer = await prisma.customer.findFirst({
          where: {
            email,
            id: { not: customerId },
          },
        });

        if (existingCustomer) {
          return sendError(res, ErrorCode.BAD_REQUEST, 'El email ya está en uso', HttpStatus.BAD_REQUEST);
        }
      }

      const updatedCustomer = await prisma.customer.update({
        where: { id: customerId },
        data: {
          firstName,
          lastName,
          email,
          phone: phone || null,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
        },
      });

      sendSuccess(res, updatedCustomer);
    } catch (error) {
      sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al actualizar perfil', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Update password
  async updatePassword(req: AuthRequest, res: Response) {
    try {
      const customerId = req.customerId;

      if (!customerId) {
        return sendError(res, ErrorCode.UNAUTHORIZED, 'No autorizado', HttpStatus.UNAUTHORIZED);
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return sendError(res, ErrorCode.BAD_REQUEST, 'Contraseña actual y nueva son requeridas', HttpStatus.BAD_REQUEST);
      }

      if (newPassword.length < 6) {
        return sendError(res, ErrorCode.BAD_REQUEST, 'La contraseña debe tener al menos 6 caracteres', HttpStatus.BAD_REQUEST);
      }

      // Get customer with password
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        return sendError(res, ErrorCode.NOT_FOUND, 'Cliente no encontrado', HttpStatus.NOT_FOUND);
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, customer.password);
      if (!isPasswordValid) {
        return sendError(res, ErrorCode.BAD_REQUEST, 'Contraseña actual incorrecta', HttpStatus.BAD_REQUEST);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.customer.update({
        where: { id: customerId },
        data: { password: hashedPassword },
      });

      sendSuccess(res, { message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al actualizar contraseña', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
