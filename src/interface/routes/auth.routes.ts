import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma.js';
import { AuthController } from '../controllers/AuthController.js';
import { AuthService } from '../../application/services/AuthService.js';
import { CartService } from '../../application/services/CartService.js';
import { PasswordResetService } from '../../application/services/PasswordResetService.js';

const router = Router();
const authService = new AuthService(prisma);
const cartService = new CartService(prisma);
const passwordResetService = new PasswordResetService(prisma);
const controller = new AuthController(authService, cartService, passwordResetService);

// Customer routes
router.post('/register', controller.registerCustomer.bind(controller));
router.post('/login', controller.loginCustomer.bind(controller));

// Admin routes
router.post('/admin/login', controller.loginAdmin.bind(controller));

// Common routes
router.post('/logout', controller.logout.bind(controller));
router.get('/me', controller.getMe.bind(controller));
router.post('/refresh', controller.refreshToken.bind(controller));

// Email verification routes
router.post('/verify-email', controller.verifyEmail.bind(controller));
router.post('/verify-email-token', controller.verifyEmailWithToken.bind(controller));
router.post('/resend-verification', controller.resendVerificationCode.bind(controller));

// Password reset routes
router.post('/forgot-password', controller.forgotPassword.bind(controller));
router.post('/reset-password', controller.resetPassword.bind(controller));
router.get('/validate-reset-token', controller.validateResetToken.bind(controller));

export default router;

