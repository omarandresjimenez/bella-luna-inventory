import { PrismaClient, DeliveryType, PaymentMethod } from '@prisma/client';
import { CreateOrderDTO, OrderFilterDTO, OrderResponse, OrderItemResponse } from '../dtos/order.dto.js';
import { CartService } from './CartService.js';
import { StoreService } from './StoreService.js';
import { emailTemplates, sendEmail, sendOrderEmails } from '../../config/sendgrid.js';

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  [key: string]: string;
}

interface OrderWithItems {
  id: string;
  orderNumber: string;
  status: string;
  deliveryType: string;
  paymentMethod: string;
  paymentStatus?: string | null;
  customerNotes?: string | null;
  subtotal: unknown;
  deliveryFee: unknown;
  discount: unknown;
  total: unknown;
  shippingAddress: unknown;
  createdAt: Date;
  items: Array<{
    id: string;
    productName: string;
    variantName: string;
    productSku: string;
    imageUrl?: string | null;
    quantity: number;
    unitPrice: unknown;
    totalPrice: unknown;
  }>;
  customer?: {
    email: string;
    firstName: string;
  };
}

export class OrderService {
  constructor(
    private prisma: PrismaClient,
    private cartService: CartService,
    private storeService: StoreService
  ) {}

  // Create order (checkout)
  async createOrder(
    data: CreateOrderDTO,
    customerId: string,
    sessionId?: string
  ): Promise<OrderResponse> {
    // Get cart
    const cart = await this.cartService.getCart(sessionId, customerId);

    if (cart.items.length === 0) {
      throw new Error('El carrito estÃ¡ vacÃ­o');
    }

    // Get store settings
    const settings = await this.storeService.getSettings();

    // Get customer address if home delivery
    let shippingAddress: ShippingAddress = {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone: ''
    };
    if (data.deliveryType === DeliveryType.HOME_DELIVERY) {
      if (!data.addressId) {
        throw new Error('Se requiere una direcciÃ³n para envÃ­o a domicilio');
      }

      const address = await this.prisma.address.findFirst({
        where: {
          id: data.addressId,
          customerId,
        },
        include: {
          customer: true,
        },
      });

      if (!address) {
        throw new Error('DirecciÃ³n no encontrada');
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
      const customer = await this.prisma.customer.findUnique({
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
    const order = await this.prisma.customerOrder.create({
      data: {
        orderNumber,
        customerId,
        shippingAddress: shippingAddress,
        deliveryType: data.deliveryType as DeliveryType,
        deliveryFee,
        storeSettingsSnapshot: {
          deliveryFee: Number(settings.deliveryFee),
          freeDeliveryThreshold: settings.freeDeliveryThreshold 
            ? Number(settings.freeDeliveryThreshold) 
            : null,
          storeName: settings.storeName,
          storeAddress: settings.storeAddress,
        },
        status: 'PENDING',
        paymentMethod: data.paymentMethod as PaymentMethod,
        paymentStatus: 'PENDING',
        subtotal,
        discount,
        total,
        customerNotes: data.customerNotes,
        items: {
          create: await Promise.all(cart.items.map(async (item) => {
            // Fetch variant details to get SKU and image
            const variant = await this.prisma.productVariant.findUnique({
              where: { id: item.variantId },
              include: {
                product: {
                  select: {
                    sku: true,
                    images: {
                      select: { thumbnailUrl: true },
                      where: { variantId: null },
                      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                      take: 1,
                    },
                  },
                },
                images: {
                  select: { thumbnailUrl: true },
                  orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  take: 1,
                },
              },
            });

            const productSku = variant?.variantSku || variant?.product.sku || 'N/A';
            const imageUrl = variant?.images[0]?.thumbnailUrl || variant?.product.images[0]?.thumbnailUrl;

            return {
              variantId: item.variantId,
              productName: item.productName,
              variantName: item.variantName,
              productSku,
              imageUrl,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            };
          })),
        },
      },
      include: {
        items: true,
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Clear cart
    await this.cartService.clearCart(sessionId, customerId);

    // Decrement stock for ordered items
    await this.decrementStock(
      order.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }))
    );

    // Send order confirmation emails to customer and admins
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (customer) {
      try {
        await sendOrderEmails(
          {
            orderNumber,
            customer: {
              id: customer.id,
              email: customer.email,
              firstName: customer.firstName,
              lastName: customer.lastName,
            },
            items: cart.items.map((item) => ({
              productName: item.productName,
              variantName: item.variantName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
            total,
            shippingAddress: shippingAddress as {
              street: string;
              city: string;
              state: string;
              zipCode: string;
            },
          },
          this.prisma
        );
      } catch (emailError) {
        // Don't throw - we don't want to fail the order if email fails
      }
    }

    return this.transformOrderResponse(order);
  }

  // Get customer's orders
  async getCustomerOrders(customerId: string, filters: OrderFilterDTO) {
    const { page = 1, limit = 20 } = filters;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      this.prisma.customerOrder.findMany({
        where: { customerId },
        include: {
          items: {
            select: {
              id: true,
              productName: true,
              variantName: true,
              productSku: true,
              imageUrl: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
              variant: {
                select: {
                  id: true,
                  productId: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.customerOrder.count({
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

  // Get order by ID or orderNumber
  async getOrderById(orderId: string, customerId?: string) {
    // Support lookup by either UUID (id) or orderNumber (e.g., BLD-2026-000006)
    const where: { OR: Array<{ id: string } | { orderNumber: string }>; customerId?: string } = {
      OR: [{ id: orderId }, { orderNumber: orderId }],
    };
    if (customerId) {
      where.customerId = customerId;
    }

    const order = await this.prisma.customerOrder.findFirst({
      where,
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            variantName: true,
            productSku: true,
            imageUrl: true,
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
    const order = await this.prisma.customerOrder.update({
      where: { id: orderId },
      data: {
        status: status as 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED',
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
    const statusMessages: Record<string, string> = {
      'CONFIRMED': 'Tu pedido ha sido confirmado y está siendo preparado.',
      'PREPARING': 'Tu pedido está siendo preparado con mucho cuidado.',
      'READY_FOR_PICKUP': 'Tu pedido está listo para recoger en nuestra tienda.',
      'OUT_FOR_DELIVERY': 'Tu pedido está en camino hacia tu dirección.',
      'DELIVERED': 'Tu pedido ha sido entregado exitosamente.',
      'CANCELLED': 'Tu pedido ha sido cancelado.',
    };

    const statusEmail = emailTemplates.orderStatusUpdate(
      order.orderNumber,
      order.customer.firstName,
      status,
      statusMessages[status] || 'Tu pedido ha sido actualizado.'
    );
    await sendEmail({
      to: order.customer.email,
      subject: statusEmail.subject,
      html: statusEmail.html,
    });

    return this.transformOrderResponse(order);
  }

  // Cancel order
  async cancelOrder(orderId: string, customerId?: string): Promise<OrderResponse> {
    const where: { id: string; customerId?: string } = { id: orderId };
    if (customerId) {
      where.customerId = customerId;
    }

    const existingOrder = await this.prisma.customerOrder.findFirst({
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

    const order = await this.prisma.customerOrder.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: { items: true },
    });

    // Restore stock for cancelled order items
    await this.restoreStock(
      order.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }))
    );

    // Send cancellation email
    const cancelEmail = emailTemplates.orderStatusUpdate(
      order.orderNumber,
      existingOrder.customer.firstName,
      'CANCELLED',
      'Tu pedido ha sido cancelado. Si tienes alguna pregunta, por favor contáctanos.'
    );
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      this.prisma.customerOrder.findMany({
        where,
        include: {
          items: {
            select: {
              id: true,
              productName: true,
              variantName: true,
              productSku: true,
              imageUrl: true,
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
      this.prisma.customerOrder.count({ where }),
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
    const count = await this.prisma.customerOrder.count({
      where: {
        createdAt: {
          gte: new Date(year, 0, 1),
        },
      },
    });

    return `BLD-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  // Decrement stock when order is created
  private async decrementStock(items: Array<{ variantId: string; quantity: number }>): Promise<void> {
    for (const item of items) {
      await this.prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }
  }

  // Restore stock when order is cancelled
  private async restoreStock(items: Array<{ variantId: string; quantity: number }>): Promise<void> {
    for (const item of items) {
      await this.prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }
  }

  // Helper: Transform order to response
  private transformOrderResponse(order: OrderWithItems): OrderResponse {
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
      items: order.items.map((item): OrderItemResponse => ({
        id: item.id,
        productName: item.productName,
        variantName: item.variantName,
        productSku: item.productSku,
        imageUrl: item.imageUrl || null,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        variant: (item as any).variant ? {
          id: (item as any).variant.id,
          productId: (item as any).variant.productId,
        } : undefined,
      })),
      shippingAddress: order.shippingAddress as OrderResponse['shippingAddress'],
      customerNotes: order.customerNotes || undefined,
      paymentStatus: order.paymentStatus || undefined,
      customer: (order as any).customer
        ? {
            firstName: (order as any).customer.firstName,
            lastName: (order as any).customer.lastName,
            email: (order as any).customer.email,
            phone: (order as any).customer.phone,
          }
        : undefined,
      createdAt: order.createdAt,
    };
  }
}


