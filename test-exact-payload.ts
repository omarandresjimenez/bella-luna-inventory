import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testExactPayload() {
  console.log('\n🧪 Testing Exact Frontend Payload\n' + '='.repeat(60));

  let productId: string;
  let staticAttrId: string;
  let variantAttrId1: string;
  let variantAttrId2: string;

  try {
    // Setup: Create attributes matching the product
    console.log('\n📝 Creating test attributes...');

    // Static attribute (Brand/Origin)
    const staticAttr = await prisma.attribute.create({
      data: {
        name: 'BRAND_ORIGIN',
        displayName: 'Origen',
        type: 'TEXT',
        sortOrder: 1,
      },
    });
    staticAttrId = staticAttr.id;
    console.log(`✅ Created static attribute: ${staticAttrId}`);

    // Variant attribute 1
    const variantAttr1 = await prisma.attribute.create({
      data: {
        name: 'SIZE',
        displayName: 'Tamaño',
        type: 'TEXT',
        sortOrder: 2,
        values: {
          create: [
            { value: 'SMALL', displayValue: 'Pequeño' },
            { value: 'LARGE', displayValue: 'Grande' },
          ],
        },
      },
      include: { values: true },
    });
    variantAttrId1 = variantAttr1.id;
    console.log(`✅ Created variant attribute 1: ${variantAttrId1}`);

    // Variant attribute 2
    const variantAttr2 = await prisma.attribute.create({
      data: {
        name: 'TYPE',
        displayName: 'Tipo',
        type: 'TEXT',
        sortOrder: 3,
        values: {
          create: [
            { value: 'BUNDLE', displayValue: 'Kit' },
            { value: 'SINGLE', displayValue: 'Individual' },
          ],
        },
      },
      include: { values: true },
    });
    variantAttrId2 = variantAttr2.id;
    console.log(`✅ Created variant attribute 2: ${variantAttrId2}`);

    // Get or create category
    let category = await prisma.category.findFirst({
      where: { name: 'Hair Care' },
    });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: 'Hair Care',
          slug: 'hair-care',
          description: 'Hair care products',
        },
      });
    }

    // Create product first (without attributes)
    console.log('\n📝 Creating product...');
    const uniqueSku = `KIT-CAP-TEST-${Date.now()}`;
    let product = await prisma.product.create({
      data: {
        sku: uniqueSku,
        name: 'Kit de Cuidado Capilar',
        description:
          'Kit con shampoo, acondicionador y mascarilla. Nutrición completa para tu cabello.',
        brand: 'Bella Luna Hair',
        slug: `kit-cuidado-capilar-${Date.now()}`,
        baseCost: 68000,
        basePrice: 149000,
        discountPercent: 10,
        trackStock: true,
        isActive: true,
        categories: {
          create: [
            {
              category: { connect: { id: category.id } },
            },
          ],
        },
      },
    });
    productId = product.id;
    console.log(`✅ Created product: ${productId} (SKU: ${uniqueSku}`);

    // Now update with attributes - EXACTLY as frontend sends it
    console.log('\n📝 Updating with exact frontend payload...');
    const updatePayload = {
      sku: uniqueSku,
      name: 'Kit de Cuidado Capilar',
      description:
        'Kit con shampoo, acondicionador y mascarilla. Nutrición completa para tu cabello.',
      brand: 'Bella Luna Hair',
      baseCost: 68000,
      basePrice: 149000,
      discountPercent: 10,
      trackStock: true,
      isActive: true,
      categoryIds: [category.id],
      attributes: [
        {
          attributeId: staticAttrId,
          value: 'Hair International', // ← Static attribute with value
        },
        {
          attributeId: variantAttrId1,
          // ← No value property (undefined)
        },
        {
          attributeId: variantAttrId2,
          // ← No value property (undefined)
        },
      ],
    };

    console.log('Payload:', JSON.stringify(updatePayload, null, 2));

    // Update exactly like the backend does
    const updateData: Record<string, any> = {};

    // Copy all fields except attributes and categoryIds
    Object.keys(updatePayload).forEach((key) => {
      if (key !== 'attributes' && key !== 'categoryIds') {
        updateData[key] = (updatePayload as any)[key];
      }
    });

    // Handle categories
    if (updatePayload.categoryIds) {
      updateData.categories = {
        deleteMany: {},
        create: updatePayload.categoryIds.map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      };
    }

    // Handle attributes - THIS IS THE CRITICAL PART
    if (updatePayload.attributes) {
      console.log('Processing attributes...');
      updatePayload.attributes.forEach((attr: any) => {
        console.log(`  - attributeId: ${attr.attributeId}, value: ${attr.value}`);
      });

      updateData.attributes = {
        deleteMany: {},
        create: updatePayload.attributes.map((attr: any) => ({
          attributeId: attr.attributeId,
          value: attr.value || null, // ← This converts undefined to null
        })),
      };
    }

    console.log('\nUpdate data structure:', JSON.stringify(updateData, null, 2));

    // Execute update
    product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        categories: {
          include: { category: true },
        },
        variants: {
          include: {
            attributeValues: {
              include: {
                attributeValue: {
                  include: { attribute: true },
                },
              },
            },
          },
        },
        images: {
          orderBy: { isPrimary: 'desc' },
        },
        attributes: {
          include: {
            attribute: {
              include: { values: true },
            },
          },
        },
      },
    });

    console.log('✅ Update completed');

    // Verify the response includes attributes
    console.log('\n📊 Product after update - Attributes in response:');
    if (!product.attributes || product.attributes.length === 0) {
      console.log('❌ NO ATTRIBUTES IN RESPONSE!');
    } else {
      console.log(`✅ Found ${product.attributes.length} attributes:`);
      product.attributes.forEach((attr) => {
        console.log(
          `   - ${attr.attribute.displayName}: value="${attr.value}" (id: ${attr.attributeId})`
        );
      });
    }

    // Now GET the product to verify persistence
    console.log('\n📝 Fetching product again (simulating GET request)...');
    const fetchedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: {
          include: { category: true },
        },
        variants: {
          include: {
            attributeValues: {
              include: {
                attributeValue: {
                  include: { attribute: true },
                },
              },
            },
          },
        },
        images: {
          orderBy: { isPrimary: 'desc' },
        },
        attributes: {
          include: {
            attribute: {
              include: { values: true },
            },
          },
        },
      },
    });

    console.log('\n📊 Product from fresh GET - Attributes:');
    if (!fetchedProduct?.attributes || fetchedProduct.attributes.length === 0) {
      console.log('❌ NO ATTRIBUTES IN GET RESPONSE!');
      console.log('\n⚠️  THIS IS THE PROBLEM - attributes are not being saved!');
    } else {
      console.log(`✅ Found ${fetchedProduct.attributes.length} attributes:`);
      fetchedProduct.attributes.forEach((attr) => {
        console.log(
          `   - ${attr.attribute.displayName}: value="${attr.value}" (id: ${attr.attributeId})`
        );
      });
    }

    // Verify in database directly
    console.log('\n📝 Checking database directly...');
    const dbAttributes = await prisma.productAttribute.findMany({
      where: { productId },
      include: {
        attribute: true,
      },
    });

    console.log(`\n📊 Database records for product attributes:`);
    if (dbAttributes.length === 0) {
      console.log('❌ NO ATTRIBUTES IN DATABASE!');
    } else {
      console.log(`✅ Found ${dbAttributes.length} records in database:`);
      dbAttributes.forEach((attr) => {
        console.log(
          `   - ${attr.attribute.displayName}: value="${attr.value}" (attributeId: ${attr.attributeId})`
        );
      });
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    if (fetchedProduct?.attributes && fetchedProduct.attributes.length > 0) {
      console.log('✅ SUCCESS: Attributes are being saved and retrieved correctly');
    } else if (dbAttributes.length > 0) {
      console.log('⚠️  PARTIAL: Attributes in DB but not returned by GET endpoint');
      console.log('   Issue: Include statement in GET is missing attributes');
    } else {
      console.log('❌ FAILURE: Attributes are not being saved to database');
      console.log('   Issue: PATCH update is not processing attributes');
    }

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  } finally {
    // Cleanup
    try {
      console.log('\n📝 Cleaning up...');
      await prisma.productAttribute.deleteMany({ where: { productId } });
      await prisma.productVariant.deleteMany({ where: { productId } });
      await prisma.productCategory.deleteMany({ where: { productId } });
      await prisma.product.delete({ where: { id: productId } });
      await prisma.attribute.deleteMany({
        where: {
          OR: [
            { id: staticAttrId },
            { id: variantAttrId1 },
            { id: variantAttrId2 },
          ],
        },
      });
      console.log('✅ Cleanup completed');
    } catch (e) {
      console.error('Cleanup error:', e);
    }

    await prisma.$disconnect();
  }
}

testExactPayload();
