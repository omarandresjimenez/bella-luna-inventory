#!/usr/bin/env node

/**
 * Database Cart Inspection Script
 * 
 * Directly queries the database to see what's stored
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function inspectDatabase() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('DATABASE CART INSPECTION');
    console.log('='.repeat(80) + '\n');
    
    // Get all carts
    const allCarts = await prisma.cart.findMany({
      include: {
        items: {
          include: {
            variant: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 Total carts in database: ${allCarts.length}\n`);
    
    for (let i = 0; i < Math.min(5, allCarts.length); i++) {
      const cart = allCarts[i];
      console.log(`Cart ${i + 1}:`);
      console.log(`  ID: ${cart.id}`);
      console.log(`  SessionId: ${cart.sessionId || 'N/A'}`);
      console.log(`  CustomerId: ${cart.customerId || 'N/A'}`);
      console.log(`  Items: ${cart.items.length}`);
      
      if (cart.items.length > 0) {
        for (const item of cart.items) {
          console.log(`    - ${item.variant?.name || item.variantId} (qty: ${item.quantity})`);
        }
      } else {
        console.log(`    (empty cart)`);
      }
      console.log();
    }
    
    // Get recent items
    const recentItems = await prisma.cartItem.findMany({
      include: {
        cart: {
          select: {
            id: true,
            sessionId: true,
            customerId: true
          }
        },
        variant: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    console.log(`📊 Recent 10 cart items:\n`);
    for (const item of recentItems) {
      console.log(`  CartItem ${item.id}:`);
      console.log(`    Variant: ${item.variant?.name}`);
      console.log(`    Quantity: ${item.quantity}`);
      console.log(`    Cart: ${item.cart.sessionId || item.cart.customerId}`);
      console.log();
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

inspectDatabase();
