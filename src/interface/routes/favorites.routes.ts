import { Router } from 'express';
import { prisma } from '../../infrastructure/database/prisma.js';
import { FavoriteController } from '../controllers/FavoriteController.js';
import { FavoriteService } from '../../application/services/FavoriteService.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const favoriteService = new FavoriteService(prisma);
const controller = new FavoriteController(favoriteService);

// All favorites routes require authentication
router.use(authMiddleware);

router.get('/product-ids', controller.getFavoriteProductIds.bind(controller));
router.get('/check/:productId', controller.isFavorite.bind(controller));
router.get('/', controller.getFavorites.bind(controller));
router.post('/', controller.addFavorite.bind(controller));
router.delete('/:productId', controller.removeFavorite.bind(controller));

export default router;

