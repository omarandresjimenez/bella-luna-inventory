import { PrismaClient } from '@prisma/client';
import { AddToCartDTO, UpdateCartItemDTO, CartResponse, CartItemResponse } from '../dtos/cart.dto.js';
import { v4 as uuidv4 } from 'uuid';

interface CartItemWithVariant {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  unitPrice: any; // Comes from Prisma Decimal type
  variant?: {
    id: string;
    product: {
      name: string;
      images: Array<{ thumbnailUrl: string; isPrimary?: boolean }>;
    };
    attributeValues: Array<{
      attributeValue: {
        displayValue: string | null;
        value: string;
      };
    }>;
  } | null;
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

    let cart;

    if (customerId) {
      // User is authenticated
      // First, verify the customer exists
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        // Customer doesn't exist - return anonymous cart with sessionId instead
        if (sessionId) {
          // Try to find existing anonymous cart
          cart = await this.prisma.cart.findUnique({
            where: { sessionId },
            include: {
              items: {
                include: {
                  variant: {
                    select: {
                      id: true,
                      product: {
                        select: {
                          name: true,
                          images: {
                            select: {
                              thumbnailUrl: true,
                              isPrimary: true,
                            },
                            orderBy: {
                              isPrimary: 'desc',
                            },
                            take: 1,
                          },
                        },
                      },
                      attributeValues: {
                        include: {
                          attributeValue: {
                            select: {
                              displayValue: true,
                              value: true,
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

          if (!cart) {
            // Create new anonymous cart
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            
            const newSessionId = uuidv4();
            cart = await this.prisma.cart.create({
              data: {
                sessionId: newSessionId,
                expiresAt,
              },
              include: {
                items: {
                  include: {
                    variant: {
                      select: {
                        id: true,
                        product: {
                          select: {
                            name: true,
                            images: {
                              select: {
                                thumbnailUrl: true,
                                isPrimary: true,
                              },
                              orderBy: {
                                isPrimary: 'desc',
                              },
                              take: 1,
                            },
                          },
                        },
                        attributeValues: {
                          include: {
                            attributeValue: {
                              select: {
                                displayValue: true,
                                value: true,
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
        }
        
        // Clean up orphaned items if any
        if (cart && cart.items && cart.items.length > 0) {
          const orphanedItems = cart.items.filter((item: CartItemWithVariant) => !item.variant);
          if (orphanedItems.length > 0) {
            await this.prisma.cartItem.deleteMany({
              where: {
                id: {
                  in: orphanedItems.map((item: CartItemWithVariant) => item.id),
                },
              },
            });
            cart.items = cart.items.filter((item: CartItemWithVariant) => item.variant);
          }
        }

        const result = this.transformCartResponse(cart as unknown as CartWithItems);
        return result;
      }

      // Try to find existing cart for customer
      cart = await this.prisma.cart.findUnique({
        where: { customerId },
        include: {
          items: {
            include: {
              variant: {
                select: {
                  id: true,
                  product: {
                    select: {
                      name: true,
                      images: {
                        select: {
                          thumbnailUrl: true,
                          isPrimary: true,
                        },
                        orderBy: {
                          isPrimary: 'desc',
                        },
                        take: 1,
                      },
                    },
                  },
                  attributeValues: {
                    include: {
                      attributeValue: {
                        select: {
                          displayValue: true,
                          value: true,
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
        cart = await this.prisma.cart.create({
          data: { customerId },
          include: {
            items: {
              include: {
                variant: {
                  select: {
                    id: true,
                    product: {
                      select: {
                        name: true,
                        images: {
                          select: {
                            thumbnailUrl: true,
                            isPrimary: true,
                          },
                          orderBy: {
                            isPrimary: 'desc',
                          },
                          take: 1,
                        },
                      },
                    },
                    attributeValues: {
                      include: {
                        attributeValue: {
                          select: {
                            displayValue: true,
                            value: true,
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

      // If sessionId is also provided (user logged in after adding items as anonymous),
      // merge items from session cart into user's cart
      if (sessionId && cart) {
        const sessionCart = await this.prisma.cart.findUnique({
          where: { sessionId },
          include: {
            items: true,
          },
        });

        if (sessionCart && sessionCart.items.length > 0) {
          // Merge items from session cart into user cart
          for (const sessionItem of sessionCart.items) {
            // Check if item already exists in user cart
            const existingItem = await this.prisma.cartItem.findUnique({
              where: {
                cartId_variantId: {
                  cartId: cart.id,
                  variantId: sessionItem.variantId,
                },
              },
            });

            if (existingItem) {
              // Add quantities together
              await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                  quantity: existingItem.quantity + sessionItem.quantity,
                },
              });
            } else {
              // Move item to user cart
              await this.prisma.cartItem.update({
                where: { id: sessionItem.id },
                data: {
                  cartId: cart.id,
                },
              });
            }
          }

          // Delete the empty session cart
          await this.prisma.cart.delete({
            where: { id: sessionCart.id },
          });

          // Refresh cart with merged items
          cart = await this.prisma.cart.findUnique({
            where: { customerId },
            include: {
              items: {
                include: {
                  variant: {
                    select: {
                      id: true,
                      product: {
                        select: {
                          name: true,
                          images: {
                            select: {
                              thumbnailUrl: true,
                              isPrimary: true,
                            },
                            orderBy: {
                              isPrimary: 'desc',
                            },
                            take: 1,
                          },
                        },
                      },
                      attributeValues: {
                        include: {
                          attributeValue: {
                            select: {
                              displayValue: true,
                              value: true,
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
      }
    } else if (sessionId) {
      // Find cart by session
      cart = await this.prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: {
              variant: {
                select: {
                  id: true,
                  product: {
                    select: {
                      name: true,
                      images: {
                        select: {
                          thumbnailUrl: true,
                          isPrimary: true,
                        },
                        orderBy: {
                          isPrimary: 'desc',
                        },
                        take: 1,
                      },
                    },
                  },
                  attributeValues: {
                    include: {
                      attributeValue: {
                        select: {
                          displayValue: true,
                          value: true,
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

        cart = await this.prisma.cart.create({
          data: {
            sessionId: newSessionId,
            expiresAt,
          },
          include: {
            items: {
              include: {
                variant: {
                  select: {
                    id: true,
                    product: {
                      select: {
                        name: true,
                        images: {
                          select: {
                            thumbnailUrl: true,
                          },
                          take: 1,
                        },
                      },
                    },
                    attributeValues: {
                      include: {
                        attributeValue: {
                          select: {
                            displayValue: true,
                            value: true,
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

      cart = await this.prisma.cart.create({
        data: {
          sessionId: newSessionId,
          expiresAt,
        },
        include: {
          items: {
            include: {
              variant: {
                select: {
                  id: true,
                  product: {
                    select: {
                      name: true,
                      images: {
                        select: {
                          thumbnailUrl: true,
                          isPrimary: true,
                        },
                        orderBy: {
                          isPrimary: 'desc',
                        },
                        take: 1,
                      },
                    },
                  },
                  attributeValues: {
                    include: {
                      attributeValue: {
                        select: {
                          displayValue: true,
                          value: true,
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

    // NOTE: Items now include variant data with product and images
    // Clean up orphaned items (items with null variants)
    if (cart && cart.items && cart.items.length > 0) {
      const orphanedItems = cart.items.filter((item: CartItemWithVariant) => !item.variant);
      if (orphanedItems.length > 0) {
        await this.prisma.cartItem.deleteMany({
          where: {
            id: {
              in: orphanedItems.map((item: CartItemWithVariant) => item.id),
            },
          },
        });
        // Filter out orphaned items from the response
        cart.items = cart.items.filter((item: CartItemWithVariant) => item.variant);
      }
    }

    const result = this.transformCartResponse(cart as unknown as CartWithItems);

    return result;
  }

  // Add item to cart
  async addItem(
    data: AddToCartDTO,
    sessionId?: string,
    customerId?: string
  ): Promise<CartResponse> {

    let variant: any = null;
    let unitPrice: number;
    let isProductDirectly = false;

    // First, try to find as a variant
    variant = await this.prisma.productVariant.findUnique({
      where: { id: data.variantId },
      include: {
        product: {
          select: {
            basePrice: true,
            discountPercent: true,
            name: true,
          },
        },
      },
    });

    // If not found as variant, try to find as a product (for products without variants)
    if (!variant) {
      const product = await this.prisma.product.findUnique({
        where: { id: data.variantId },
        select: {
          id: true,
          name: true,
          basePrice: true,
          discountPercent: true,
        },
      });

      if (!product) {
        throw new Error('Variante o producto no encontrado');
      }

      // Create or get default variant for product without variants
      variant = await this.prisma.productVariant.findFirst({
        where: { productId: product.id },
        include: {
          product: {
            select: {
              basePrice: true,
              discountPercent: true,
              name: true,
            },
          },
        },
      });

      if (!variant) {
        // Create a default variant for this product
        variant = await this.prisma.productVariant.create({
          data: {
            productId: product.id,
            stock: 999, // Default high stock for products without variants
            price: product.basePrice,
            isActive: true,
          },
          include: {
            product: {
              select: {
                basePrice: true,
                discountPercent: true,
                name: true,
              },
            },
          },
        });
      }

      // Calculate final price: basePrice * (1 - discountPercent/100)
      const discount = Number(product.discountPercent || 0);
      unitPrice = Number(product.basePrice) * (1 - discount / 100);
      isProductDirectly = true;
    } else {
      unitPrice = variant.price
        ? Number(variant.price)
        : Number(variant.product.basePrice);
    }

    // Get or create cart
    const cart = await this.getCartEntity(sessionId, customerId);


    // Check if item already exists
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: variant.id,
        },
      },
    });

    if (existingItem) {
      // Update quantity

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + data.quantity,
        },
      });
    } else {
      // Create new item

      try {
        const created = await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            variantId: variant.id,
            quantity: data.quantity,
            unitPrice,
          },
        });

      } catch (error) {

        throw error;
      }
    }


    // IMPORTANT: Use cart.sessionId if no sessionId was provided, so we get the right cart back
    const cartSessionId = sessionId || cart.sessionId || undefined;
    const result = await this.getCart(cartSessionId, customerId);

    return result;
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
      await this.prisma.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      // Update quantity

      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: data.quantity },
      });
    }

    // IMPORTANT: Use cart.sessionId if no sessionId was provided
    const cartSessionId = sessionId || cart.sessionId || undefined;
    const result = await this.getCart(cartSessionId, customerId);

    return result;
  }

  // Remove item from cart
  async removeItem(
    itemId: string,
    sessionId?: string,
    customerId?: string
  ): Promise<CartResponse> {
    try {
      const cart = await this.getCartEntity(sessionId, customerId);

      // First, verify the item exists
      const item = await this.prisma.cartItem.findFirst({
        where: {
          id: itemId,
          cartId: cart.id,
        },
      });

      if (!item) {
        throw new Error('Item no encontrado');
      }

      // Use a transaction to ensure atomicity
      const result = await this.prisma.$transaction(async (tx) => {
        // Delete the cart item
        await tx.cartItem.delete({
          where: { id: itemId },
        });

        // Return updated cart
        const cartSessionId = sessionId || cart.sessionId || undefined;
        return this.getCart(cartSessionId, customerId);
      });

      return result;
    } catch (error: any) {
      // Provide more specific error messages
      if (error.message === 'Item no encontrado') {
        throw error;
      }

      if (error.code === 'P2014' || error.code === 'P2003') {
        // Foreign key constraint violation - variant may have been deleted
        throw new Error('No se puede eliminar el item: el producto puede haber sido eliminado');
      }

      throw new Error(`Error al eliminar item del carrito: ${error.message}`);
    }
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

    let cart;

    if (customerId) {

      cart = await this.prisma.cart.findUnique({
        where: { customerId },
      });

      if (!cart) {
        // Verify customer exists before creating cart
        const customer = await this.prisma.customer.findUnique({
          where: { id: customerId },
        });

        if (!customer) {
          // Customer doesn't exist - fall back to anonymous cart with sessionId
          // This handles cases where JWT has an invalid customerId
          if (sessionId) {
            cart = await this.prisma.cart.findUnique({
              where: { sessionId },
            });

            if (!cart) {
              const expiresAt = new Date();
              expiresAt.setDate(expiresAt.getDate() + 7);
              
              cart = await this.prisma.cart.create({
                data: {
                  sessionId,
                  expiresAt,
                },
              });
            }
          } else {
            // Create new anonymous cart
            const newSessionId = uuidv4();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            cart = await this.prisma.cart.create({
              data: {
                sessionId: newSessionId,
                expiresAt,
              },
            });
          }
        } else {
          // Customer exists, create their cart
          cart = await this.prisma.cart.create({
            data: { customerId },
          });
        }
      }

    } else if (sessionId) {

      cart = await this.prisma.cart.findUnique({
        where: { sessionId },
      });

      if (!cart) {

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

    } else {
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

    }

    return cart;
  }

  // Helper: Get cart entity (alias for backward compatibility)
  private async getCartEntity(sessionId?: string, customerId?: string) {
    return this.getCartEntityBasic(sessionId, customerId);
  }

  // Helper: Transform cart to response
  private transformCartResponse(cart: CartWithItems & { sessionId?: string }): CartResponse {

    
    const items: CartItemResponse[] = (cart.items || []).map((item: CartItemWithVariant) => {
      // Handle products added directly (without variants)
      if (!item.variant) {
        // For items without variant, return generic product name
        return {
          id: item.id,
          variantId: item.variantId,
          productName: 'Producto',
          variantName: '',
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.unitPrice) * item.quantity,
          imageUrl: undefined,
        };
      }

      const variantName = (item.variant.attributeValues || [])
        .map((av) => av.attributeValue.displayValue || av.attributeValue.value)
        .join(' - ');

      const imageUrl = item.variant.product.images[0]?.thumbnailUrl;

      return {
        id: item.id,
        variantId: item.variantId,
        productName: item.variant.product.name,
        variantName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.unitPrice) * item.quantity,
        imageUrl,
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

    return result;
  }
}

