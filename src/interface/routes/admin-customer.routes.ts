import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma.js';
import { AdminCustomerController } from '../controllers/AdminCustomerController.js';
import { CustomerAdminService } from '../../application/services/CustomerAdminService.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const customerService = new CustomerAdminService(prisma);
const controller = new AdminCustomerController(customerService);

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Customer management
router.get('/customers', controller.getAllCustomers.bind(controller));
router.get('/customers/stats', controller.getCustomersStats.bind(controller));
router.get('/customers/recent', controller.getRecentCustomers.bind(controller));
router.get('/customers/:id', controller.getCustomerById.bind(controller));
router.post('/customers', controller.createCustomer.bind(controller));
router.patch('/customers/:id', controller.updateCustomer.bind(controller));
router.delete('/customers/:id', controller.deleteCustomer.bind(controller));
router.patch('/customers/:id/toggle-verification', controller.toggleVerificationStatus.bind(controller));

export default router;
