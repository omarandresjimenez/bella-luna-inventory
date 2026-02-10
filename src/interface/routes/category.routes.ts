import { Router } from 'express';
import multer from 'multer';
import { CategoryController } from '../controllers/CategoryController';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new CategoryController();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no soportado. Solo JPG, PNG y WebP'));
    }
  },
});

// Public routes
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

// Admin routes (require authentication and admin role)
router.post('/', authMiddleware, adminMiddleware, controller.create);
router.put('/:id', authMiddleware, adminMiddleware, controller.update);
router.delete('/:id', authMiddleware, adminMiddleware, controller.delete);

// Category image management (admin only)
router.post(
  '/:id/image',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  controller.uploadImage
);
router.delete('/:id/image', authMiddleware, adminMiddleware, controller.deleteImage);

export default router;
