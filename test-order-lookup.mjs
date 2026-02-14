import { prisma } from './dist/infrastructure/database/prisma.js';

async function testOrderLookup() {
  const orderNumber = process.argv[2] || 'BLD-2026-000006';
  
  console.log('Testing order lookup for:', orderNumber);
  
  // Test lookup by orderNumber
  const order = await prisma.customerOrder.findFirst({
    where: {
      OR: [
        { id: orderNumber },
        { orderNumber: orderNumber }
      ]
    },
    select: {
      id: true,
      orderNumber: true,
      customerId: true,
      status: true,
      customer: {
        select: {
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
  
  if (order) {
    console.log('✅ Order found:');
    console.log(JSON.stringify(order, null, 2));
  } else {
    console.log('❌ Order not found with orderNumber:', orderNumber);
    
    // Try to find any orders with similar pattern
    const similarOrders = await prisma.customerOrder.findMany({
      where: {
        orderNumber: {
          contains: '2026'
        }
      },
      select: {
        orderNumber: true,
        customer: {
          select: {
            email: true
          }
        }
      },
      take: 5
    });
    
    if (similarOrders.length > 0) {
      console.log('\nSimilar orders found:');
      similarOrders.forEach(o => console.log(`  - ${o.orderNumber} (${o.customer.email})`));
    } else {
      console.log('\nNo orders found with pattern "2026"');
    }
  }
  
  await prisma.$disconnect();
}

testOrderLookup().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
