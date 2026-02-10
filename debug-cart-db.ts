import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugCart() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('CART DEBUG - Database State Check');
    console.log('='.repeat(80) + '\n');

    // Get all carts
    const carts = await prisma.cart.findMany({
      include: {
        items: {
          include: {
            variant: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`📊 Found ${carts.length} carts:\n`);
    
    for (const cart of carts) {
      console.log(`Cart ID: ${cart.id}`);
      console.log(`  SessionId: ${cart.sessionId || 'N/A'}`);
      console.log(`  CustomerId: ${cart.customerId || 'N/A'}`);
      console.log(`  Items: ${cart.items?.length || 0}`);
      
      if (cart.items && cart.items.length > 0) {
        for (const item of cart.items) {
          console.log(`    - CartItem ${item.id}`);
          console.log(`      Variant: ${item.variant?.name || item.variantId}`);
          console.log(`      Qty: ${item.quantity}, UnitPrice: ${item.unitPrice}`);
        }
      }
      console.log();
    }

    // Check for orphaned cart items
    console.log('\n' + '='.repeat(80));
    console.log('Checking for orphaned or recent cart items:\n');
    
    const recentItems = await prisma.cartItem.findMany({
      include: {
        cart: { select: { sessionId: true, customerId: true } },
        variant: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`Found ${recentItems.length} recent cart items:\n`);
    for (const item of recentItems) {
      console.log(`CartItem: ${item.id}`);
      console.log(`  Cart: ${item.cart.sessionId || item.cart.customerId || 'unknown'}`);
      console.log(`  Variant: ${item.variant.name} (${item.variant.id})`);
      console.log(`  Qty: ${item.quantity}\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCart();
