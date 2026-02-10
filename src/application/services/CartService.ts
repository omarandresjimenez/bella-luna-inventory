import { PrismaClient } from '@prisma/client';
import { AddToCartDTO, UpdateCartItemDTO, CartResponse, CartItemResponse } from '../dtos/cart.dto';
import { v4 as uuidv4 } from 'uuid';

interface CartItemWithVariant {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: unknown;
  variant: {
    product: {
      name: string;
      images: Array<{ thumbnailUrl: string }>;
    };
    attributeValues: Array<{
      attributeValue: {
        displayValue: string | null;
        value: string;
      };
    }>;
  };
}

interface CartWithItems {
  id: string;
  sessionId?: string;
  customerId?: string;
  items: CartItemWithVariant[];
}

export class CartService {
  constructor(private prisma: PrismaClient) {}
  // Get or create cart
  async getCart(sessionId?: string, customerId?: string): Promise<CartResponse> {
    console.log('[CartService.getCart] START', { sessionId, customerId });
    let cart;

    if (customerId) {
      // Try to find existing cart for customer
      console.log('[CartService.getCart] Looking for customer cart:', customerId);
      cart = await this.prisma.cart.findUnique({
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
      console.log('[CartService.getCart] Customer cart found:', { cartId: cart?.id, itemsCount: cart?.items?.length });

      // Create cart if doesn't exist
      if (!cart) {
        console.log('[CartService.getCart] Creating new customer cart');
        cart = await this.prisma.cart.create({
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
      console.log('[CartService.getCart] Looking for session cart:', sessionId);
      cart = await this.prisma.cart.findUnique({
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
      console.log('[CartService.getCart] Session cart found:', { cartId: cart?.id, itemsCount: cart?.items?.length });

      // Create new cart if session doesn't exist
      if (!cart) {
        console.log('[CartService.getCart] Creating new session cart');
        const newSessionId = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        cart = await this.prisma.cart.create({
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
        console.log('[CartService.getCart] New session cart created:', { cartId: cart.id, newSessionId });
      }
    } else {
      // Create anonymous cart
      console.log('[CartService.getCart] Creating anonymous cart (no sessionId or customerId)');
      const newSessionId = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      cart = await this.prisma.cart.create({
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
      console.log('[CartService.getCart] Anonymous cart created:', { cartId: cart.id, sessionId: cart.sessionId });
    }

    console.log('[CartService.getCart] Transforming cart response');
    console.log('[CartService.getCart] Cart object before transform:', { 
      id: cart.id, 
      sessionId: cart.sessionId,
      hasItems: 'items' in cart,
      itemsType: typeof cart.items,
      itemsIsArray: Array.isArray(cart.items),
      itemsLength: Array.isArray(cart.items) ? cart.items.length : 'N/A',
      cartKeys: Object.keys(cart)
    });
    if (Array.isArray(cart.items) && cart.items.length > 0) {
      console.log('[CartService.getCart] First item in cart.items:', {
        itemKeys: Object.keys(cart.items[0] || {}),
        firstItem: JSON.stringify(cart.items[0])
      });
    }
    const result = this.transformCartResponse(cart as CartWithItems);
    console.log('[CartService.getCart] DONE', { itemCount: result.itemCount, itemsCount: result.items?.length });
    return result;
  }

  // Add item to cart
  async addItem(
    data: AddToCartDTO,
    sessionId?: string,
    customerId?: string
  ): Promise<CartResponse> {
    console.log('[CartService.addItem] START', { sessionId, customerId, variantId: data.variantId, quantity: data.quantity });
    
    // Get current price of variant
    const variant = await this.prisma.productVariant.findUnique({
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
    const cart = await this.getCartEntity(sessionId, customerId);
    console.log('[CartService.addItem] Got cart:', { cartId: cart.id, sessionId: cart.sessionId, customerId: cart.customerId });

    // Check if item already exists
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: data.variantId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      console.log('[CartService.addItem] Updating existing item:', { itemId: existingItem.id });
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + data.quantity,
        },
      });
    } else {
      // Create new item
      console.log('[CartService.addItem] Creating new item:', { cartId: cart.id, variantId: data.variantId, quantity: data.quantity, unitPrice });
      try {
        const created = await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            variantId: data.variantId,
            quantity: data.quantity,
            unitPrice,
          },
        });
        console.log('[CartService.addItem] Item created:', { itemId: created.id });
      } catch (error) {
        console.error('[CartService.addItem] ERROR creating item:', error);
        throw error;
      }
    }

    console.log('[CartService.addItem] Calling getCart to fetch updated cart');
    // IMPORTANT: Use cart.sessionId if no sessionId was provided, so we get the right cart back
    const cartSessionId = sessionId || cart.sessionId || undefined;
    const result = await this.getCart(cartSessionId, customerId);
    console.log('[CartService.addItem] Final result:', { itemCount: result.itemCount, itemsLength: result.items?.length });
    return result;
  }

  // Update cart item quantity
  async updateItem(
    itemId: string,
    data: UpdateCartItemDTO,
    sessionId?: string,
    customerId?: string
  ): Promise<CartResponse> {
    console.log('[CartService.updateItem] START', { itemId, sessionId, customerId, quantity: data.quantity });
    
    // Verify cart ownership
    const cart = await this.getCartEntity(sessionId, customerId);
    console.log('[CartService.updateItem] Got cart:', { cartId: cart.id, sessionId: cart.sessionId });

    const item = await this.prisma.cartItem.findFirst({
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
      console.log('[CartService.updateItem] Deleting item (quantity=0):', { itemId });
      await this.prisma.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      // Update quantity
      console.log('[CartService.updateItem] Updating quantity:', { itemId, newQuantity: data.quantity });
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: data.quantity },
      });
    }

    // IMPORTANT: Use cart.sessionId if no sessionId was provided
    const cartSessionId = sessionId || cart.sessionId || undefined;
    const result = await this.getCart(cartSessionId, customerId);
    console.log('[CartService.updateItem] Final result:', { itemCount: result.itemCount, itemsLength: result.items?.length });
    return result;
  }

  // Remove item from cart
  async removeItem(
    itemId: string,
    sessionId?: string,
    customerId?: string
  ): Promise<CartResponse> {
    console.log('[CartService.removeItem] START', { itemId, sessionId, customerId });
    
    const cart = await this.getCartEntity(sessionId, customerId);
    console.log('[CartService.removeItem] Got cart:', { cartId: cart.id, sessionId: cart.sessionId });

    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new Error('Item no encontrado');
    }

    console.log('[CartService.removeItem] Deleting item:', { itemId });
    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    // IMPORTANT: Use cart.sessionId if no sessionId was provided
    const cartSessionId = sessionId || cart.sessionId || undefined;
    const result = await this.getCart(cartSessionId, customerId);
    console.log('[CartService.removeItem] Final result:', { itemCount: result.itemCount, itemsLength: result.items?.length });
    return result;
  }

  // Clear cart
  async clearCart(sessionId?: string, customerId?: string): Promise<void> {
    const cart = await this.getCartEntity(sessionId, customerId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  // Merge anonymous cart with customer cart
  async mergeCarts(sessionId: string, customerId: string): Promise<CartResponse> {
    const anonCart = await this.prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (!anonCart || anonCart.items.length === 0) {
      return this.getCart(undefined, customerId);
    }

    const customerCart = await this.getCartEntity(undefined, customerId);

    // Merge items
    for (const item of anonCart.items) {
      const existingItem = await this.prisma.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: customerCart.id,
            variantId: item.variantId,
          },
        },
      });

      if (existingItem) {
        await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + item.quantity,
          },
        });
      } else {
        await this.prisma.cartItem.create({
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
    await this.prisma.cart.delete({
      where: { id: anonCart.id },
    });

    return this.getCart(undefined, customerId);
  }

  // Helper: Get cart entity (basic, without items)
  private async getCartEntityBasic(sessionId?: string, customerId?: string) {
    console.log('[CartService.getCartEntityBasic] START', { sessionId, customerId });
    let cart;

    if (customerId) {
      console.log('[CartService.getCartEntityBasic] Looking for customer cart:', customerId);
      cart = await this.prisma.cart.findUnique({
        where: { customerId },
      });

      if (!cart) {
        console.log('[CartService.getCartEntityBasic] Creating new customer cart');
        cart = await this.prisma.cart.create({
          data: { customerId },
        });
      }
      console.log('[CartService.getCartEntityBasic] Customer cart:', { cartId: cart.id, sessionId: cart.sessionId });
    } else if (sessionId) {
      console.log('[CartService.getCartEntityBasic] Looking for session cart:', sessionId);
      cart = await this.prisma.cart.findUnique({
        where: { sessionId },
      });

      if (!cart) {
        console.log('[CartService.getCartEntityBasic] Creating new session cart');
        // Create cart for anonymous user with sessionId
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        cart = await this.prisma.cart.create({
          data: {
            sessionId,
            expiresAt,
          },
        });
      }
      console.log('[CartService.getCartEntityBasic] Session cart:', { cartId: cart.id, sessionId: cart.sessionId });
    } else {
      console.log('[CartService.getCartEntityBasic] Creating anonymous cart (no sessionId)');
      // No sessionId or customerId - create an anonymous cart
      const newSessionId = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      cart = await this.prisma.cart.create({
        data: {
          sessionId: newSessionId,
          expiresAt,
        },
      });
      console.log('[CartService.getCartEntityBasic] Anonymous cart created:', { cartId: cart.id, newSessionId });
    }

    return cart;
  }

  // Helper: Get cart entity (alias for backward compatibility)
  private async getCartEntity(sessionId?: string, customerId?: string) {
    return this.getCartEntityBasic(sessionId, customerId);
  }

  // Helper: Transform cart to response
  private transformCartResponse(cart: CartWithItems & { sessionId?: string }): CartResponse {
    console.log('[CartService.transformCartResponse] START', { cartId: cart.id, itemsCount: cart.items?.length, sessionId: cart.sessionId });
    
    const items: CartItemResponse[] = (cart.items || []).map((item: CartItemWithVariant) => {
      console.log('[CartService.transformCartResponse] Mapping item:', { itemId: item.id, variantId: item.variantId, quantity: item.quantity });
      const variantName = item.variant.attributeValues
        .map((av) => av.attributeValue.displayValue || av.attributeValue.value)
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
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const result = {
      id: cart.id,
      items,
      subtotal,
      itemCount,
      sessionId: cart.sessionId,
    };
    
    console.log('[CartService.transformCartResponse] DONE', { itemsCount: items.length, itemCount, subtotal, sessionId: result.sessionId });
    return result;
  }
}
