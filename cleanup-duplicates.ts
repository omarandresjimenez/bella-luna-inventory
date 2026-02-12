import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  try {
    console.log('🧹 Starting cleanup of duplicates...\n');

    // 1. Remove duplicate AttributeValues
    console.log('📊 Checking for duplicate AttributeValues...');
    const allAttributeValues = await prisma.attributeValue.findMany({
      orderBy: [{ attributeId: 'asc' }, { value: 'asc' }],
      include: {
        variants: true,
      },
    });

    const seenAttributeValues = new Map<string, string>();
    const duplicateValueIds: string[] = [];

    for (const value of allAttributeValues) {
      const key = `${value.attributeId}:${value.value}`;
      if (seenAttributeValues.has(key)) {
        // This is a duplicate
        const firstId = seenAttributeValues.get(key)!;
        
        // If this duplicate has no variants, mark it for deletion
        if (value.variants.length === 0) {
          duplicateValueIds.push(value.id);
          console.log(`  ⚠️ Duplicate found: "${value.value}" (attributeId: ${value.attributeId.substring(0, 8)}...)`);
          console.log(`     Keeping: ${firstId.substring(0, 8)}...`);
          console.log(`     Deleting: ${value.id.substring(0, 8)}...`);
        } else {
          console.log(`  ⚠️ Duplicate with variants (keeping): "${value.value}" (id: ${value.id.substring(0, 8)}...)`);
        }
      } else {
        seenAttributeValues.set(key, value.id);
      }
    }

    if (duplicateValueIds.length > 0) {
      console.log(`\n🗑️ Deleting ${duplicateValueIds.length} duplicate AttributeValues...`);
      await prisma.attributeValue.deleteMany({
        where: { id: { in: duplicateValueIds } },
      });
      console.log(`✅ Deleted ${duplicateValueIds.length} duplicate AttributeValues\n`);
    } else {
      console.log('✅ No duplicate AttributeValues to delete\n');
    }

    // 2. Remove duplicate Variants (same product with identical attribute combinations)
    console.log('📊 Checking for duplicate ProductVariants...');
    const allProducts = await prisma.product.findMany({
      include: {
        variants: {
          include: {
            attributeValues: {
              select: { attributeValueId: true },
            },
            cartItems: true,
            orderItems: true,
          },
        },
      },
    });

    let totalDuplicateVariants = 0;

    for (const product of allProducts) {
      if (product.variants.length < 2) continue;

      // Create a signature for each variant based on its attribute values
      const variantSignatures = new Map<string, { id: string; hasData: boolean }>();

      for (const variant of product.variants) {
        // Sort attribute IDs to create consistent signature
        const attrIds = variant.attributeValues
          .map((av) => av.attributeValueId)
          .sort()
          .join('|');

        const hasData = variant.cartItems.length > 0 || variant.orderItems.length > 0;

        if (variantSignatures.has(attrIds)) {
          const existing = variantSignatures.get(attrIds)!;
          console.log(`  ⚠️ Duplicate variant found in "${product.name}"`);
          console.log(`     Keeping variant: ${existing.id.substring(0, 8)}... (${existing.hasData ? 'has data' : 'no data'})`);
          console.log(`     Deleting variant: ${variant.id.substring(0, 8)}... (${hasData ? 'has data' : 'no data'})`);

          // Only delete if the variant has no associated cart items or orders
          if (!hasData) {
            await prisma.productVariant.delete({
              where: { id: variant.id },
            });
            totalDuplicateVariants++;
            console.log(`     ✅ Deleted`);
          } else {
            console.log(`     ⚠️ Skipped (has cart/order data)`);
          }
        } else {
          variantSignatures.set(attrIds, { id: variant.id, hasData });
        }
      }
    }

    if (totalDuplicateVariants > 0) {
      console.log(`\n✅ Deleted ${totalDuplicateVariants} duplicate ProductVariants\n`);
    } else {
      console.log('✅ No duplicate ProductVariants to delete\n');
    }

    // 3. Summary
    console.log('====================================');
    console.log('✅ CLEANUP COMPLETE');
    console.log('====================================');
    console.log(`Duplicate AttributeValues removed: ${duplicateValueIds.length}`);
    console.log(`Duplicate ProductVariants removed: ${totalDuplicateVariants}`);
    console.log('====================================\n');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicates();
