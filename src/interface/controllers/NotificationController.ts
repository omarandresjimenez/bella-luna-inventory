import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';

// Store notifications in memory (last 10 per admin)
const adminNotifications = new Map<string, any[]>();

export const notificationController = {
  /**
   * GET /api/admin/notifications
   * Returns recent notifications for the authenticated admin
   * Used for polling on Vercel where WebSockets aren't available
   */
  getNotifications: async (req: any, res: Response) => {
    try {
      const adminId = req.user.userId;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      
      // Get admin's notifications from memory
      const notifications = adminNotifications.get(adminId) || [];
      
      return res.json({
        success: true,
        data: notifications.slice(0, limit),
      });
    } catch (error) {
      console.error('[NotificationController] Error fetching notifications:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch notifications',
      });
    }
  },

  /**
   * Internal method: Add notification to admin's queue
   * Called when a new order is created
   */
  addNotification: (adminId: string, notification: any) => {
    if (!adminNotifications.has(adminId)) {
      adminNotifications.set(adminId, []);
    }
    
    const notifications = adminNotifications.get(adminId)!;
    notifications.unshift(notification); // Add to front
    
    // Keep only last 10 notifications
    if (notifications.length > 10) {
      notifications.pop();
    }
  },

  /**
   * Internal method: Broadcast notification to all admins
   * Called when a new order is created
   */
  broadcastNotification: (notification: any) => {
    // In production, this would broadcast to all connected admins
    // For now, we just log it
    console.log('[NotificationController] Broadcast notification:', notification.message);
  },
};

export const notificationRoutes = Router();

notificationRoutes.get('/admin/notifications', authMiddleware, notificationController.getNotifications);

export default notificationRoutes;
