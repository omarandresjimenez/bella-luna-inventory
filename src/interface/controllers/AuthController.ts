import { Request, Response } from 'express';
import { AuthService } from '../../application/services/AuthService.js';
import { CartService } from '../../application/services/CartService.js';
import {
  registerCustomerSchema,
  loginCustomerSchema,
  loginAdminSchema,
} from '../../application/dtos/auth.dto.js';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response.js';

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
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al iniciar sesiÃ³n', HttpStatus.INTERNAL_SERVER_ERROR);
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
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al iniciar sesiÃ³n', HttpStatus.INTERNAL_SERVER_ERROR);
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
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Token invÃ¡lido', HttpStatus.UNAUTHORIZED);
      }
    }
  }

  // Verify Email with Code
  async verifyEmail(req: Request, res: Response) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        sendError(res, ErrorCode.BAD_REQUEST, 'Email y código son requeridos', HttpStatus.BAD_REQUEST);
        return;
      }

      const result = await this.authService.verifyEmail(email, code);
      
      if (result.success) {
        sendSuccess(res, result, HttpStatus.OK);
      } else {
        sendError(res, ErrorCode.BAD_REQUEST, result.message, HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al verificar email', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Resend Verification Code
  async resendVerificationCode(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        sendError(res, ErrorCode.BAD_REQUEST, 'Email es requerido', HttpStatus.BAD_REQUEST);
        return;
      }

      const result = await this.authService.resendVerificationLink(email);
      
      if (result.success) {
        sendSuccess(res, result, HttpStatus.OK);
      } else {
        sendError(res, ErrorCode.BAD_REQUEST, result.message, HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al enviar código', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Verify Email with Token (Magic Link)
  async verifyEmailWithToken(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        sendError(res, ErrorCode.BAD_REQUEST, 'Token es requerido', HttpStatus.BAD_REQUEST);
        return;
      }

      const result = await this.authService.verifyEmailWithToken(token);
      
      if (result.success) {
        sendSuccess(res, result, HttpStatus.OK);
      } else {
        sendError(res, ErrorCode.BAD_REQUEST, result.message, HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al verificar email', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}

