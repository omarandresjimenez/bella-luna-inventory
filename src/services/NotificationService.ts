import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { notificationController } from '../interface/controllers/NotificationController.js';

export interface OrderData {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  total: number;
  createdAt: Date;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AdminSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class NotificationService {
  private static io: SocketIOServer;
  private static connectedAdmins = new Map<string, AdminSocket>();

  /**
   * Initialize Socket.io server
   */
  static initialize(io: SocketIOServer) {
    this.io = io;
    console.log('[NotificationService] Initializing Socket.io...');

    // Setup CORS
    this.io.engine.generateId = () => {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    // Middleware for JWT authentication
    this.io.use((socket: AdminSocket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token is required'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        socket.userId = decoded.id;
        socket.userRole = decoded.role;

        // Only allow admins/managers to connect
        if (!['ADMIN', 'MANAGER'].includes(decoded.role)) {
          return next(new Error('Unauthorized: Only admins and managers can receive notifications'));
        }

        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });

    // Connection handler
    this.io.on('connection', (socket: AdminSocket) => {
      console.log(`[NotificationService] Admin connected: ${socket.id} (User: ${socket.userId})`);
      
      // Store admin connection
      if (socket.userId) {
        this.connectedAdmins.set(socket.id, socket);
      }

      // Disconnect handler
      socket.on('disconnect', () => {
        console.log(`[NotificationService] Admin disconnected: ${socket.id}`);
        this.connectedAdmins.delete(socket.id);
      });

      // Optional: Send connection confirmation
      socket.emit('notification:connected', {
        message: 'You are connected to notifications',
        timestamp: new Date(),
      });
    });

    console.log('[NotificationService] Socket.io initialized successfully');
  }

  /**
   * Emit a new order notification to all connected admins
   */
  static emitNewOrder(order: OrderData) {
    if (!this.io) {
      console.error('[NotificationService] Socket.io not initialized when emitting new order');
      return;
    }

    const notification = {
      type: 'order:created',
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: `${order.customer?.firstName} ${order.customer?.lastName}`,
      customerEmail: order.customer?.email,
      total: order.total,
      timestamp: order.createdAt,
      message: `New order #${order.orderNumber} from ${order.customer?.firstName} ${order.customer?.lastName}`,
    };

    // Emit to all connected admins via WebSocket
    this.io.emit('order:created', notification);
    console.log(`[NotificationService] New order notification sent: ${order.orderNumber} to ${this.connectedAdmins.size} admin(s)`);

    // Also store in polling storage for Vercel/production fallback
    // Store for all connected admin users
    const pollingNotification = {
      id: `order-${order.id}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: `New order #${order.orderNumber} from ${order.customer?.firstName} ${order.customer?.lastName}`,
      type: 'success' as const,
      customerId: order.customerId,
      customerName: `${order.customer?.firstName} ${order.customer?.lastName}`,
      total: order.total,
      status: order.status,
      timestamp: order.createdAt,
      read: false,
    };

    // Broadcast to all connected Socket.io admins for polling storage
    this.connectedAdmins.forEach((adminSocket) => {
      if (adminSocket.userId) {
        notificationController.addNotification(adminSocket.userId, pollingNotification);
      }
    });

    console.log(`[NotificationService] Polling notification stored for ${this.connectedAdmins.size} admin(s)`);
  }

  /**
   * Emit an order status change notification to all connected admins
   */
  static emitOrderStatusChange(orderId: string, newStatus: string, orderData?: any) {
    if (!this.io) {
      console.warn('[NotificationService] Socket.io not initialized');
      return;
    }

    const notification = {
      type: 'order:status-changed',
      orderId,
      orderNumber: orderData?.orderNumber,
      newStatus,
      timestamp: new Date(),
      message: `Order #${orderData?.orderNumber} status changed to ${newStatus}`,
    };

    // Emit to all connected admins via WebSocket
    this.io.emit('order:status-changed', notification);
    console.log(`[NotificationService] Order status change notification sent: ${orderId} -> ${newStatus}`);

    // Also store in polling storage
    const pollingNotification = {
      id: `status-${orderId}-${Date.now()}`,
      orderId,
      orderNumber: orderData?.orderNumber,
      message: `Order #${orderData?.orderNumber} status changed to ${newStatus}`,
      type: 'info' as const,
      status: newStatus,
      timestamp: new Date(),
      read: false,
    };

    // Store for all connected Socket.io admins
    this.connectedAdmins.forEach((adminSocket) => {
      if (adminSocket.userId) {
        notificationController.addNotification(adminSocket.userId, pollingNotification);
      }
    });
  }

  /**
   * Emit a general admin notification to all connected admins
   */
  static emitAdminNotification(title: string, message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') {
    if (!this.io) {
      console.warn('[NotificationService] Socket.io not initialized');
      return;
    }

    const notification = {
      type: 'admin:notification',
      title,
      message,
      notificationType: type,
      timestamp: new Date(),
    };

    // Emit to all connected admins
    this.io.emit('admin:notification', notification);
    console.log(`[NotificationService] Admin notification sent: ${title}`);
  }

  /**
   * Emit a notification to a specific admin user
   */
  static emitToAdmin(userId: string, title: string, message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') {
    if (!this.io) {
      console.warn('[NotificationService] Socket.io not initialized');
      return;
    }

    const userSockets = Array.from(this.connectedAdmins.values()).filter(
      socket => socket.userId === userId
    );

    const notification = {
      type: 'admin:notification',
      title,
      message,
      notificationType: type,
      timestamp: new Date(),
    };

    userSockets.forEach(socket => {
      socket.emit('admin:notification', notification);
    });

    console.log(`[NotificationService] Personal notification sent to admin: ${userId}`);
  }

  /**
   * Get count of connected admins
   */
  static getConnectedAdminCount(): number {
    return this.connectedAdmins.size;
  }

  /**
   * Emit to all except a specific socket
   */
  static broadcastExcept(socketId: string, event: string, data: any) {
    if (!this.io) {
      console.warn('[NotificationService] Socket.io not initialized');
      return;
    }

    this.io.except(socketId).emit(event, data);
  }
}
