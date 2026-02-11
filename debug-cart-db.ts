import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugCart() {
  try {
    console.log('\n' + '='.repeat(80));

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


    
    for (const cart of carts) {




      
      if (cart.items && cart.items.length > 0) {
        for (const item of cart.items) {



        }
      }

    }

    // Check for orphaned cart items
    console.log('\n' + '='.repeat(80));

    
    const recentItems = await prisma.cartItem.findMany({
      include: {
        cart: { select: { sessionId: true, customerId: true } },
        variant: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });


    for (const item of recentItems) {


      console.log(`  Variant: ${item.variant.name} (${item.variant.id})`);

    }

  } catch (error) {

  } finally {
    await prisma.$disconnect();
  }
}

debugCart();
