import { Request, Response } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { CartService } from '../../application/services/CartService';
import {
  registerCustomerSchema,
  loginCustomerSchema,
  loginAdminSchema,
} from '../../application/dtos/auth.dto';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response';

export class AuthController {
  constructor(private authService: AuthService, private cartService: CartService) {}

  // Customer Registration
  async registerCustomer(req: Request, res: Response) {
    try {
      const data = registerCustomerSchema.parse(req.body);
      const result = await this.authService.registerCustomer(data);
      sendSuccess(res, result, HttpStatus.CREATED);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.VALIDATION_ERROR, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al registrar usuario', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Customer Login
  async loginCustomer(req: Request, res: Response) {
    try {
      const data = loginCustomerSchema.parse(req.body);
      const sessionId = req.headers['x-session-id'] as string | undefined;
      

      
      const result = await this.authService.loginCustomer(data);
      
      // Merge anonymous cart with customer cart if sessionId provided
      if (sessionId) {

        try {
          const mergedCart = await this.cartService.mergeCarts(sessionId, result.customer.id);

        } catch (mergeError) {

          // Don't fail the login if merge fails, just log it
        }
      }
      
      sendSuccess(res, result);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.UNAUTHORIZED, error.message, HttpStatus.UNAUTHORIZED);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al iniciar sesión', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Admin Login
  async loginAdmin(req: Request, res: Response) {
    try {
      const data = loginAdminSchema.parse(req.body);
      const result = await this.authService.loginAdmin(data);
      sendSuccess(res, result);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.UNAUTHORIZED, error.message, HttpStatus.UNAUTHORIZED);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al iniciar sesión', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Logout
  async logout(req: Request, res: Response) {
    sendSuccess(res, { message: 'Logout successful' });
  }

  // Get Current User
  async getMe(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendError(res, ErrorCode.UNAUTHORIZED, 'Token requerido', HttpStatus.UNAUTHORIZED);
        return;
      }

      const token = authHeader.substring(7);
      const user = await this.authService.getMe(token);
      sendSuccess(res, user);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.UNAUTHORIZED, error.message, HttpStatus.UNAUTHORIZED);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener usuario', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Refresh Token
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        sendError(res, ErrorCode.BAD_REQUEST, 'Refresh token requerido', HttpStatus.BAD_REQUEST);
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);
      sendSuccess(res, result);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.UNAUTHORIZED, error.message, HttpStatus.UNAUTHORIZED);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Token inválido', HttpStatus.UNAUTHORIZED);
      }
    }
  }
}
