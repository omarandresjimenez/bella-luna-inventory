import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAttributeSave() {
  console.log('\n🧪 Testing Attribute Save Flow\n' + '='.repeat(60));

  let productId: string;

  try {
    // Use existing attributes or create new ones with unique names
    const timestamp = Date.now();
    
    console.log('\n📝 Setting up attributes...');
    
    // Static attribute
    const staticAttr = await prisma.attribute.upsert({
      where: { name: `ORIGIN_${timestamp}` },
      update: {},
      create: {
        name: `ORIGIN_${timestamp}`,
        displayName: 'Origen',
        type: 'TEXT',
        sortOrder: 1,
      },
    });
    console.log(`✅ Static attribute: ${staticAttr.id}`);

    // Variant attributes
    const varAttr1 = await prisma.attribute.upsert({
      where: { name: `SIZE_${timestamp}` },
      update: {},
      create: {
        name: `SIZE_${timestamp}`,
        displayName: 'Tamaño',
        type: 'TEXT',
        sortOrder: 2,
        values: {
          create: [{ value: 'M', displayValue: 'Mediano' }],
        },
      },
      include: { values: true },
    });
    console.log(`✅ Variant attribute 1: ${varAttr1.id}`);

    const varAttr2 = await prisma.attribute.upsert({
      where: { name: `TYPE_${timestamp}` },
      update: {},
      create: {
        name: `TYPE_${timestamp}`,
        displayName: 'Tipo',
        type: 'TEXT',
        sortOrder: 3,
        values: {
          create: [{ value: 'KIT', displayValue: 'Kit' }],
        },
      },
      include: { values: true },
    });
    console.log(`✅ Variant attribute 2: ${varAttr2.id}`);

    // Create category
    const cat = await prisma.category.findFirst({
      where: { name: 'Hair Care' },
    });
    const categoryId = cat?.id;
    if (!categoryId) {
      console.error('❌ Hair Care category not found');
      return;
    }

    // Create product
    console.log('\n📝 Creating product...');
    const sku = `TEST-${timestamp}`;
    const product = await prisma.product.create({
      data: {
        sku,
        name: 'Test Product',
        slug: `test-${timestamp}`,
        baseCost: 100,
        basePrice: 200,
        trackStock: true,
        isActive: true,
        categories: {
          create: [{ category: { connect: { id: categoryId } } }],
        },
      },
    });
    productId = product.id;
    console.log(`✅ Created product: ${productId}`);

    // Update with attributes - EXACT structure from frontend
    console.log('\n📝 Updating with attributes (exact frontend structure)...');
    console.log('Payload:', {
      attributes: [
        { attributeId: staticAttr.id, value: 'International' },
        { attributeId: varAttr1.id }, // No value
        { attributeId: varAttr2.id }, // No value
      ],
    });

    const updateData: any = {
      attributes: {
        deleteMany: {},
        create: [
          { attributeId: staticAttr.id, value: 'International' },
          { attributeId: varAttr1.id, value: null },
          { attributeId: varAttr2.id, value: null },
        ],
      },
    };

    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        attributes: {
          include: { attribute: { include: { values: true } } },
        },
      },
    });

    console.log('\n✅ Update response includes attributes:', updated.attributes.length > 0);
    if (updated.attributes.length > 0) {
      updated.attributes.forEach((a) => {
        console.log(
          `   - ${a.attribute.displayName}: "${a.value}" (${a.attributeId.substring(0, 8)}...)`
        );
      });
    } else {
      console.log('   ❌ NO ATTRIBUTES IN UPDATE RESPONSE');
    }

    // Fetch fresh data
    console.log('\n📝 Fetching product (fresh GET)...');
    const fresh = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        attributes: {
          include: { attribute: { include: { values: true } } },
        },
      },
    });

    console.log('\n✅ GET response includes attributes:', fresh?.attributes?.length ?? 0);
    if (fresh?.attributes && fresh.attributes.length > 0) {
      fresh.attributes.forEach((a) => {
        console.log(
          `   - ${a.attribute.displayName}: "${a.value}" (${a.attributeId.substring(0, 8)}...)`
        );
      });
    } else {
      console.log('   ❌ NO ATTRIBUTES IN GET RESPONSE');
    }

    // Check database directly
    console.log('\n📝 Checking database directly...');
    const dbAttrs = await prisma.productAttribute.findMany({
      where: { productId },
      include: { attribute: true },
    });

    console.log(`\n📊 Database has ${dbAttrs.length} attribute records:`);
    if (dbAttrs.length > 0) {
      dbAttrs.forEach((a) => {
        console.log(`   - ${a.attribute.displayName}: "${a.value}"`);
      });
    }

    // Final verdict
    console.log('\n' + '='.repeat(60));
    if (fresh?.attributes && fresh.attributes.length > 0 && dbAttrs.length > 0) {
      console.log('✅ SUCCESS: Attributes save and retrieve correctly!');
    } else if (dbAttrs.length > 0 && (!fresh?.attributes || fresh.attributes.length === 0)) {
      console.log('⚠️  PARTIAL: DB has attributes but GET not returning them');
      console.log('   Issue: Check the include statement in GET endpoint');
    } else {
      console.log('❌ FAILURE: Attributes not saving to database');
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  } finally {
    // Cleanup
    try {
      if (productId) {
        await prisma.productAttribute.deleteMany({ where: { productId } });
        await prisma.product.delete({ where: { id: productId } });
      }
    } catch (e) {
      // Ignore
    }
    await prisma.$disconnect();
  }
}

testAttributeSave();
