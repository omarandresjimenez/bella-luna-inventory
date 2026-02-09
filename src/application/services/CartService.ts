import { PrismaClient, Prisma } from '@prisma/client';
import { AddToCartDTO, UpdateCartItemDTO, CartResponse, CartItemResponse } from '../dtos/cart.dto';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class CartService {
  // Get or create cart
  async getCart(sessionId?: string, customerId?: string): Promise<CartResponse> {
    let cart;

    if (customerId) {
      // Try to find existing cart for customer
      cart = await prisma.cart.findUnique({
        where: { customerId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      name: true,
                      images: {
                        where: { isPrimary: true },
                        take: 1,
                        select: { thumbnailUrl: true },
                      },
                    },
                  },
                  attributeValues: {
                    include: {
                      attributeValue: {
                        include: {
                          attribute: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Create cart if doesn't exist
      if (!cart) {
        cart = await prisma.cart.create({
          data: { customerId },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: {
                      select: {
                        name: true,
                        images: {
                          where: { isPrimary: true },
                          take: 1,
                          select: { thumbnailUrl: true },
                        },
                      },
                    },
                    attributeValues: {
                      include: {
                        attributeValue: {
                          include: {
                            attribute: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });
      }
    } else if (sessionId) {
      // Find cart by session
      cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      name: true,
                      images: {
                        where: { isPrimary: true },
                        take: 1,
                        select: { thumbnailUrl: true },
                      },
                    },
                  },
                  attributeValues: {
                    include: {
                      attributeValue: {
                        include: {
                          attribute: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Create new cart if session doesn't exist
      if (!cart) {
        const newSessionId = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        cart = await prisma.cart.create({
          data: {
            sessionId: newSessionId,
            expiresAt,
          },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: {
                      select: {
                        name: true,
                        images: {
                          where: { isPrimary: true },
                          take: 1,
                          select: { thumbnailUrl: true },
                        },
                      },
                    },
                    attributeValues: {
                      include: {
                        attributeValue: {
                          include: {
                            attribute: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });
      }
    } else {
      // Create anonymous cart
      const newSessionId = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      cart = await prisma.cart.create({
        data: {
          sessionId: newSessionId,
          expiresAt,
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      name: true,
                      images: {
                        where: { isPrimary: true },
                        take: 1,
                        select: { thumbnailUrl: true },
                      },
                    },
                  },
                  attributeValues: {
                    include: {
                      attributeValue: {
                        include: {
                          attribute: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    return this.transformCartResponse(cart);
  }

  // Add item to cart
  async addItem(
    data: AddToCartDTO,
    sessionId?: string,
    customerId?: string
  ): Promise<CartResponse> {
    // Get current price of variant
    const variant = await prisma.productVariant.findUnique({
      where: { id: data.variantId },
      include: {
        product: {
          select: {
            basePrice: true,
            discountPercent: true,
          },
        },
      },
    });

    if (!variant) {
      throw new Error('Variante no encontrada');
    }

    const unitPrice = variant.price
      ? Number(variant.price)
      : Number(variant.product.basePrice);

    // Get or create cart
    let cart = await this.getCartEntity(sessionId, customerId);

    // Check if item already exists
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: data.variantId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + data.quantity,
        },
      });
    } else {
      // Create new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: data.variantId,
          quantity: data.quantity,
          unitPrice,
        },
      });
    }

    return this.getCart(sessionId, customerId);
  }

  // Update cart item quantity
  async updateItem(
    itemId: string,
    data: UpdateCartItemDTO,
    sessionId?: string,
    customerId?: string
  ): Promise<CartResponse> {
    // Verify cart ownership
    const cart = await this.getCartEntity(sessionId, customerId);

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new Error('Item no encontrado');
    }

    if (data.quantity === 0) {
      // Remove item
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: data.quantity },
      });
    }

    return this.getCart(sessionId, customerId);
  }

  // Remove item from cart
  async removeItem(
    itemId: string,
    sessionId?: string,
    customerId?: string
  ): Promise<CartResponse> {
    const cart = await this.getCartEntity(sessionId, customerId);

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new Error('Item no encontrado');
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(sessionId, customerId);
  }

  // Clear cart
  async clearCart(sessionId?: string, customerId?: string): Promise<void> {
    const cart = await this.getCartEntity(sessionId, customerId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  // Merge anonymous cart with customer cart
  async mergeCarts(sessionId: string, customerId: string): Promise<CartResponse> {
    const anonCart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (!anonCart || anonCart.items.length === 0) {
      return this.getCart(undefined, customerId);
    }

    const customerCart = await this.getCartEntity(undefined, customerId);

    // Merge items
    for (const item of anonCart.items) {
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: customerCart.id,
            variantId: item.variantId,
          },
        },
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + item.quantity,
          },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: customerCart.id,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        });
      }
    }

    // Delete anonymous cart
    await prisma.cart.delete({
      where: { id: anonCart.id },
    });

    return this.getCart(undefined, customerId);
  }

  // Helper: Get cart entity
  private async getCartEntity(sessionId?: string, customerId?: string) {
    let cart;

    if (customerId) {
      cart = await prisma.cart.findUnique({
        where: { customerId },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { customerId },
        });
      }
    } else if (sessionId) {
      cart = await prisma.cart.findUnique({
        where: { sessionId },
      });

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }
    } else {
      throw new Error('Se requiere sessionId o customerId');
    }

    return cart;
  }

  // Helper: Transform cart to response
  private transformCartResponse(cart: any): CartResponse {
    const items: CartItemResponse[] = cart.items.map((item: any) => {
      const variantName = item.variant.attributeValues
        .map((av: any) => av.attributeValue.displayValue || av.attributeValue.value)
        .join(' - ');

      return {
        id: item.id,
        variantId: item.variantId,
        productName: item.variant.product.name,
        variantName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.unitPrice) * item.quantity,
        imageUrl: item.variant.product.images[0]?.thumbnailUrl,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      id: cart.id,
      items,
      subtotal,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }
}
