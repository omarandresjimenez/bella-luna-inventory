import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStock() {
  try {
    // Get out of stock products same way as controller
    const outOfStockProducts = await prisma.product.findMany({
      where: {
        isDeleted: false,
        OR: [
          { stock: 0 },
          {
            variants: {
              some: {
                stock: 0,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        stock: true,
        variants: {
          where: { stock: 0 },
          select: { id: true },
        },
      },
    });

    const outOfStockCount = outOfStockProducts.reduce((count, product) => {
      return product.stock === 0 ? count + 1 : count + product.variants.length;
    }, 0);

    console.log('Out of Stock Products Query Result:');
    console.log('Total products with stock=0 or variants with stock=0:', outOfStockProducts.length);
    console.log('Calculated count (products + variant items):', outOfStockCount);
    console.log('\nBreakdown:');
    outOfStockProducts.forEach((p, idx) => {
      if (p.stock === 0) {
        console.log(`  [${idx}] Product stock=0: +1`);
      } else {
        console.log(`  [${idx}] Product has ${p.variants.length} variants with stock=0: +${p.variants.length}`);
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStock();
