import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('PRODUCT & VARIANT CHECK');
    console.log('='.repeat(80) + '\n');

    // Get all products
    const products = await prisma.product.findMany({
      include: {
        variants: {
          include: {
            attributeValues: true
          }
        },
        images: true
      },
      take: 5
    });

    console.log(`Found ${products.length} products:\n`);

    for (const product of products) {
      console.log(`Product: ${product.name}`);
      console.log(`  ID: ${product.id}`);
      console.log(`  Price: ${product.basePrice}`);
      console.log(`  Variants: ${product.variants?.length || 0}`);
      
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          console.log(`    - Variant ID: ${variant.id}`);
          console.log(`      Name: ${variant.name}`);
          console.log(`      Price: ${variant.price || product.basePrice}`);
          console.log(`      Stock: ${variant.stock}`);
        }
      }
      console.log();
    }

    // Get all variants
    console.log('\n' + '-'.repeat(80));
    console.log('All available variants:\n');

    const allVariants = await prisma.productVariant.findMany({
      include: { product: { select: { name: true } } },
      take: 20
    });

    for (const variant of allVariants) {
      console.log(`${variant.id}: ${variant.product.name} - ${variant.name}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
