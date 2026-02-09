import { PrismaClient, Prisma } from '@prisma/client';

// Enums
const DeliveryType = {
  HOME_DELIVERY: 'HOME_DELIVERY',
  STORE_PICKUP: 'STORE_PICKUP',
} as const;

const PaymentMethod = {
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
  STORE_PAYMENT: 'STORE_PAYMENT',
} as const;
import { CreateOrderDTO, OrderFilterDTO, OrderResponse, OrderItemResponse } from '../dtos/order.dto';
import { CartService } from './CartService';
import { StoreService } from './StoreService';
import { emailTemplates, sendEmail } from '../../config/sendgrid';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class OrderService {
  private cartService: CartService;
  private storeService: StoreService;

  constructor() {
    this.cartService = new CartService();
    this.storeService = new StoreService();
  }

  // Create order (checkout)
  async createOrder(
    data: CreateOrderDTO,
    customerId: string,
    sessionId?: string
  ): Promise<OrderResponse> {
    // Get cart
    const cart = await this.cartService.getCart(sessionId, customerId);

    if (cart.items.length === 0) {
      throw new Error('El carrito está vacío');
    }

    // Get store settings
    const settings = await this.storeService.getSettings();

    // Get customer address if home delivery
    let shippingAddress: any = {};
    if (data.deliveryType === DeliveryType.HOME_DELIVERY) {
      if (!data.addressId) {
        throw new Error('Se requiere una dirección para envío a domicilio');
      }

      const address = await prisma.address.findFirst({
        where: {
          id: data.addressId,
          customerId,
        },
      });

      if (!address) {
        throw new Error('Dirección no encontrada');
      }

      shippingAddress = {
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.customer?.phone || '',
      };
    } else {
      // Pickup in store - use store address
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { phone: true },
      });

      shippingAddress = {
        street: settings.storeAddress || 'Recoger en tienda',
        city: '',
        state: '',
        zipCode: '',
        country: 'Colombia',
        phone: customer?.phone || '',
      };
    }

    // Calculate totals
    const subtotal = cart.subtotal;
    const deliveryFee = data.deliveryType === DeliveryType.HOME_DELIVERY
      ? settings.deliveryFee
      : 0;
    const discount = 0; // Calculate if applicable
    const total = subtotal + deliveryFee - discount;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = await prisma.customerOrder.create({
      data: {
        orderNumber,
        customerId,
        shippingAddress: shippingAddress as any,
        deliveryType: data.deliveryType as DeliveryType,
        deliveryFee,
        status: 'PENDING',
        paymentMethod: data.paymentMethod as PaymentMethod,
        paymentStatus: 'PENDING',
        subtotal,
        discount,
        total,
        customerNotes: data.customerNotes,
        items: {
          create: cart.items.map((item) => ({
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Clear cart
    await this.cartService.clearCart(sessionId, customerId);

    // Send confirmation email
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (customer) {
      const confirmationEmail = emailTemplates.orderConfirmation(orderNumber, total);
      await sendEmail({
        to: customer.email,
        subject: confirmationEmail.subject,
        html: confirmationEmail.html,
      });
    }

    return this.transformOrderResponse(order);
  }

  // Get customer's orders
  async getCustomerOrders(customerId: string, filters: OrderFilterDTO) {
    const { page = 1, limit = 20 } = filters;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      prisma.customerOrder.findMany({
        where: { customerId },
        include: {
          items: {
            select: {
              id: true,
              productName: true,
              variantName: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.customerOrder.count({
        where: { customerId },
      }),
    ]);

    return {
      orders: orders.map((order) => this.transformOrderResponse(order)),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  // Get order by ID
  async getOrderById(orderId: string, customerId?: string) {
    const where: any = { id: orderId };
    if (customerId) {
      where.customerId = customerId;
    }

    const order = await prisma.customerOrder.findFirst({
      where,
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            variantName: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    return this.transformOrderResponse(order);
  }

  // Update order status (admin)
  async updateOrderStatus(
    orderId: string,
    status: string,
    adminNotes?: string
  ): Promise<OrderResponse> {
    const order = await prisma.customerOrder.update({
      where: { id: orderId },
      data: {
        status: status as any,
        ...(adminNotes && { adminNotes }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
      },
      include: {
        items: true,
        customer: {
          select: {
            email: true,
            firstName: true,
          },
        },
      },
    });

    // Send status update email
    const statusEmail = emailTemplates.orderStatusUpdate(order.orderNumber, status);
    await sendEmail({
      to: order.customer.email,
      subject: statusEmail.subject,
      html: statusEmail.html,
    });

    return this.transformOrderResponse(order);
  }

  // Cancel order
  async cancelOrder(orderId: string, customerId?: string): Promise<OrderResponse> {
    const where: any = { id: orderId };
    if (customerId) {
      where.customerId = customerId;
    }

    const existingOrder = await prisma.customerOrder.findFirst({
      where,
      include: {
        items: true,
        customer: {
          select: {
            email: true,
            firstName: true,
          },
        },
      },
    });

    if (!existingOrder) {
      throw new Error('Orden no encontrada');
    }

    if (existingOrder.status === 'DELIVERED' || existingOrder.status === 'CANCELLED') {
      throw new Error('No se puede cancelar esta orden');
    }

    const order = await prisma.customerOrder.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: { items: true },
    });

    // Send cancellation email
    const cancelEmail = emailTemplates.orderStatusUpdate(order.orderNumber, 'CANCELLED');
    await sendEmail({
      to: existingOrder.customer.email,
      subject: cancelEmail.subject,
      html: cancelEmail.html,
    });

    return this.transformOrderResponse(order);
  }

  // Get all orders (admin)
  async getAllOrders(filters: OrderFilterDTO) {
    const { status, page = 1, limit = 20, startDate, endDate } = filters;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      prisma.customerOrder.findMany({
        where,
        include: {
          items: {
            select: {
              id: true,
              productName: true,
              variantName: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
            },
          },
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.customerOrder.count({ where }),
    ]);

    return {
      orders: orders.map((order) => this.transformOrderResponse(order)),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  // Helper: Generate order number
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.customerOrder.count({
      where: {
        createdAt: {
          gte: new Date(year, 0, 1),
        },
      },
    });

    return `BLD-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  // Helper: Transform order to response
  private transformOrderResponse(order: any): OrderResponse {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      deliveryType: order.deliveryType,
      paymentMethod: order.paymentMethod,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discount: Number(order.discount),
      total: Number(order.total),
      items: order.items.map((item: any): OrderItemResponse => ({
        id: item.id,
        productName: item.productName,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
    };
  }
}
