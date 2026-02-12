import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  data?: any;
}

const results: TestResult[] = [];

async function log(message: string) {
  console.log(`\n📝 ${message}`);
}

async function logSuccess(message: string, data?: any) {
  console.log(`✅ ${message}`);
  if (data) console.log('   Data:', JSON.stringify(data, null, 2));
}

async function logError(message: string, error?: any) {
  console.log(`❌ ${message}`);
  if (error) console.log('   Error:', error.message || error);
}

async function test(name: string, fn: () => Promise<boolean>) {
  try {
    const passed = await fn();
    results.push({ name, passed, details: passed ? 'Success' : 'Failed assertion' });
    if (passed) logSuccess(name);
    else logError(name);
  } catch (error: any) {
    results.push({ name, passed: false, details: error.message });
    logError(name, error);
  }
}

async function runTests() {
  console.log('\n🧪 ATTRIBUTE SAVE FLOW TEST\n' + '='.repeat(50));

  let testProductId: string;
  let staticAttrId: string;
  let variantAttrId: string;
  let attrValueId: string;

  // Setup: Create test attributes
  await log('SETUP: Creating test attributes');
  
  try {
    // Create static attribute (Material)
    const staticAttr = await prisma.attribute.create({
      data: {
        name: 'TEST_MATERIAL',
        displayName: 'Material',
        type: 'TEXT',
        sortOrder: 1,
      },
    });
    staticAttrId = staticAttr.id;
    logSuccess(`Created static attribute: ${staticAttrId}`);

    // Create variant attribute with values (Color)
    const variantAttr = await prisma.attribute.create({
      data: {
        name: 'TEST_COLOR',
        displayName: 'Color',
        type: 'COLOR_HEX',
        sortOrder: 2,
        values: {
          create: [
            { value: 'RED', displayValue: 'Rojo', colorHex: '#FF0000' },
            { value: 'BLUE', displayValue: 'Azul', colorHex: '#0000FF' },
          ],
        },
      },
      include: { values: true },
    });
    variantAttrId = variantAttr.id;
    attrValueId = variantAttr.values[0].id;
    logSuccess(`Created variant attribute: ${variantAttrId} with ${variantAttr.values.length} values`);
  } catch (error: any) {
    logError('Failed to create test attributes', error);
    process.exit(1);
  }

  // TEST 1: Create product with STATIC attributes
  await test('TEST 1: Create product with static attributes', async () => {
    try {
      const product = await prisma.product.create({
        data: {
          sku: 'TEST-STATIC-001',
          name: 'Test Product Static',
          description: 'Test product with static attributes',
          brand: 'Test Brand',
          slug: 'test-static-001',
          baseCost: 100,
          basePrice: 200,
          discountPercent: 10,
          trackStock: true,
          isActive: true,
          attributes: {
            create: [
              {
                attributeId: staticAttrId,
                value: 'Polyester', // Static attribute has a value
              },
            ],
          },
        },
        include: {
          attributes: {
            include: {
              attribute: {
                include: { values: true },
              },
            },
          },
        },
      });

      testProductId = product.id;
      logSuccess('Product created with ID:', product.id);
      logSuccess('Attributes in response:', product.attributes);

      const hasStaticAttr = product.attributes.some(
        (pa) => pa.attributeId === staticAttrId && pa.value === 'Polyester'
      );
      
      if (!hasStaticAttr) {
        logError('Static attribute not found in response');
        return false;
      }

      return true;
    } catch (error) {
      logError('Create failed', error);
      throw error;
    }
  });

  // TEST 2: Verify static attributes in GET
  await test('TEST 2: Fetch product and verify static attributes exist', async () => {
    const product = await prisma.product.findUnique({
      where: { id: testProductId },
      include: {
        attributes: {
          include: {
            attribute: {
              include: { values: true },
            },
          },
        },
      },
    });

    if (!product) {
      logError('Product not found');
      return false;
    }

    logSuccess('Fetched product:', { id: product.id, sku: product.sku });
    logSuccess('Attributes:', product.attributes);

    const hasStaticAttr = product.attributes.some(
      (pa) => pa.attributeId === staticAttrId && pa.value === 'Polyester'
    );

    if (!hasStaticAttr) {
      logError('Static attribute missing after fetch');
      return false;
    }

    // Check that attribute.values is populated for admin dropdown
    const attrWithValues = product.attributes.find((pa) => pa.attributeId === staticAttrId);
    if (!attrWithValues?.attribute?.values) {
      logError('Attribute.values is missing (needed for admin form dropdown)');
      return false;
    }

    return true;
  });

  // TEST 3: Update product with VARIANT attributes
  await test('TEST 3: Update product to add variant attributes', async () => {
    try {
      const product = await prisma.product.update({
        where: { id: testProductId },
        data: {
          attributes: {
            deleteMany: {},
            create: [
              { attributeId: staticAttrId, value: 'Cotton' },
              { attributeId: variantAttrId, value: null }, // Variant attribute (no static value)
            ],
          },
        },
        include: {
          attributes: {
            include: {
              attribute: {
                include: { values: true },
              },
            },
          },
        },
      });

      logSuccess('Product updated with variant attributes');
      logSuccess('Attributes in update response:', product.attributes);

      const hasStaticAttr = product.attributes.some(
        (pa) => pa.attributeId === staticAttrId && pa.value === 'Cotton'
      );
      const hasVariantAttr = product.attributes.some(
        (pa) => pa.attributeId === variantAttrId && !pa.value
      );

      if (!hasStaticAttr) {
        logError('Static attribute not found in update response');
        return false;
      }

      if (!hasVariantAttr) {
        logError('Variant attribute not found in update response');
        return false;
      }

      return true;
    } catch (error) {
      logError('Update failed', error);
      throw error;
    }
  });

  // TEST 4: Verify both attribute types in GET after update
  await test('TEST 4: Fetch product after update and verify all attributes', async () => {
    const product = await prisma.product.findUnique({
      where: { id: testProductId },
      include: {
        attributes: {
          include: {
            attribute: {
              include: { values: true },
            },
          },
        },
      },
    });

    if (!product) {
      logError('Product not found after update');
      return false;
    }

    logSuccess('Fetched updated product');
    logSuccess('All attributes:', product.attributes);

    const staticAttr = product.attributes.find((pa) => pa.attributeId === staticAttrId);
    const variantAttr = product.attributes.find((pa) => pa.attributeId === variantAttrId);

    if (!staticAttr || staticAttr.value !== 'Cotton') {
      logError('Static attribute incorrect');
      return false;
    }

    if (!variantAttr || variantAttr.value !== null) {
      logError('Variant attribute incorrect (should have null value)');
      return false;
    }

    // Verify attribute.values exists for both
    if (!staticAttr.attribute.values || !variantAttr.attribute.values) {
      logError('Attribute.values missing for dropdown population');
      return false;
    }

    logSuccess('Static attribute value:', staticAttr.value);
    logSuccess('Static attribute.values:', staticAttr.attribute.values);
    logSuccess('Variant attribute value:', variantAttr.value);
    logSuccess('Variant attribute.values:', variantAttr.attribute.values);

    return true;
  });

  // TEST 5: Create variant with attribute values
  await test('TEST 5: Create variant with attribute value selections', async () => {
    try {
      const variant = await prisma.productVariant.create({
        data: {
          productId: testProductId,
          variantSku: 'TEST-VAR-001',
          cost: 80,
          price: 150,
          stock: 10,
          isActive: true,
          attributeValues: {
            create: [
              {
                attributeValueId: attrValueId,
              },
            ],
          },
        },
        include: {
          attributeValues: {
            include: {
              attributeValue: {
                include: { attribute: true },
              },
            },
          },
        },
      });

      logSuccess('Variant created:', variant.id);
      logSuccess('Variant attributes:', variant.attributeValues);

      const hasAttributeValue = variant.attributeValues.some(
        (av) => av.attributeValueId === attrValueId
      );

      if (!hasAttributeValue) {
        logError('Attribute value not assigned to variant');
        return false;
      }

      // Check nested attribute data
      const attrData = variant.attributeValues[0]?.attributeValue?.attribute;
      if (!attrData) {
        logError('Nested attribute data missing from variant response');
        return false;
      }

      logSuccess('Nested attribute in variant:', {
        id: attrData.id,
        name: attrData.name,
        displayName: attrData.displayName,
      });

      return true;
    } catch (error) {
      logError('Variant creation failed', error);
      throw error;
    }
  });

  // TEST 6: Verify variant attributes in GET
  await test('TEST 6: Fetch product with variants and verify all nested data', async () => {
    const product = await prisma.product.findUnique({
      where: { id: testProductId },
      include: {
        attributes: {
          include: {
            attribute: {
              include: { values: true },
            },
          },
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
      },
    });

    if (!product) {
      logError('Product not found');
      return false;
    }

    logSuccess('Fetched product with all relations');

    // Check product attributes
    if (!product.attributes || product.attributes.length === 0) {
      logError('Product attributes missing');
      return false;
    }

    // Check variant data
    if (!product.variants || product.variants.length === 0) {
      logError('Variants missing');
      return false;
    }

    const variant = product.variants[0];
    if (!variant.attributeValues || variant.attributeValues.length === 0) {
      logError('Variant attribute values missing');
      return false;
    }

    const attrValue = variant.attributeValues[0];
    if (!attrValue.attributeValue?.attribute) {
      logError('Variant nested attribute data missing');
      return false;
    }

    logSuccess('Full product structure verified');
    logSuccess('Variant attributes:', {
      variantId: variant.id,
      attributeCount: variant.attributeValues.length,
      attribute: {
        id: attrValue.attributeValue.attribute.id,
        name: attrValue.attributeValue.attribute.name,
      },
    });

    return true;
  });

  // Cleanup
  await log('CLEANUP: Removing test data');
  try {
    await prisma.productVariant.deleteMany({ where: { productId: testProductId } });
    await prisma.product.delete({ where: { id: testProductId } });
    await prisma.attribute.deleteMany({
      where: {
        OR: [{ id: staticAttrId }, { id: variantAttrId }],
      },
    });
    logSuccess('Test data cleaned up');
  } catch (error: any) {
    logError('Cleanup failed', error);
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY\n');
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach((r, i) => {
    const icon = r.passed ? '✅' : '❌';
    console.log(`${i + 1}. ${icon} ${r.name}`);
    if (!r.passed) console.log(`   ${r.details}`);
  });

  console.log(`\n${passed}/${total} tests passed\n`);

  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED - Attribute flow is working correctly!\n');
  } else {
    console.log(`⚠️  ${total - passed} test(s) failed\n`);
  }

  return passed === total;
}

// Run tests
runTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Test suite failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
