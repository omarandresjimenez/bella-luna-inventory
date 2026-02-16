import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma.js';
import { AdminOrderController } from '../controllers/AdminOrderController.js';
import { OrderService } from '../../application/services/OrderService.js';
import { CartService } from '../../application/services/CartService.js';
import { StoreService } from '../../application/services/StoreService.js';
import { POSSaleController } from '../controllers/POSSaleController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const cartService = new CartService(prisma);
const storeService = new StoreService(prisma);
const orderService = new OrderService(prisma, cartService, storeService);
const orderController = new AdminOrderController(orderService);
const posSaleController = new POSSaleController(prisma);

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Order management
router.get('/orders', orderController.getAllOrders.bind(orderController));
router.get('/orders/:id', orderController.getOrderById.bind(orderController));
router.patch('/orders/:id/status', orderController.updateOrderStatus.bind(orderController));
router.post('/orders/:id/cancel', orderController.cancelOrder.bind(orderController));

// POS Sales management
router.post('/pos/sales', posSaleController.createSale.bind(posSaleController));
router.get('/pos/sales', posSaleController.getSales.bind(posSaleController));
router.get('/pos/sales/:id', posSaleController.getSaleById.bind(posSaleController));
router.post('/pos/sales/:id/void', posSaleController.voidSale.bind(posSaleController));

// POS Analytics
router.get('/pos/summary', posSaleController.getSalesSummary.bind(posSaleController));
router.get('/pos/sales-over-time', posSaleController.getSalesOverTime.bind(posSaleController));
router.get('/pos/top-products', posSaleController.getTopProducts.bind(posSaleController));
router.get('/pos/sales-by-staff', posSaleController.getSalesByStaff.bind(posSaleController));
router.get('/pos/export', posSaleController.exportSales.bind(posSaleController));

export default router;

