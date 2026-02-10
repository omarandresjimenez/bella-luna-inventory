import { PrismaClient } from '@prisma/client';
import { CartService } from './src/application/services/CartService';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const cartService = new CartService(prisma);

async function testCartFlow() {
  console.log('\n' + '='.repeat(80));
  console.log('DIRECT CART SERVICE TEST');
  console.log('='.repeat(80) + '\n');

  try {
    // Test with sessionId
    const testSessionId = uuidv4();
    console.log('1️⃣  Testing with sessionId:', testSessionId);

    // Get or create cart
    console.log('\n   Calling getCart()...');
    let cart = await cartService.getCart(testSessionId);
    console.log('   ✅ Got cart:', { id: cart.id, items: cart.items?.length, sessionId: cart.sessionId });

    // Add an item
    console.log('\n2️⃣  Adding item to cart...');
    console.log('   Calling addItem({ variantId: "variant-1", quantity: 2 })...');
    
    // First, let's verify the variant exists
    const variant = await prisma.productVariant.findUnique({
      where: { id: 'variant-1' }
    });
    
    if (!variant) {
      console.log('   ⚠️  Variant "variant-1" not found. Creating test data...');
      // This would need test data
      throw new Error('Test variant not found');
    }

    const addResult = await cartService.addItem(
      { variantId: 'variant-1', quantity: 2 },
      testSessionId
    );
    console.log('   ✅ Added item. Cart now has:', { items: addResult.items?.length, itemCount: addResult.itemCount });

    // Verify items are in the response
    if (addResult.items && addResult.items.length > 0) {
      console.log('   ✅ Items are in the response!');
      addResult.items.forEach((item, i) => {
        console.log(`      Item ${i + 1}: ${item.productName} (qty: ${item.quantity})`);
      });
    } else {
      console.log('   ❌ NO ITEMS in response!');
      console.log('   Response:', JSON.stringify(addResult, null, 2));
    }

    // Get cart again to verify persistence
    console.log('\n3️⃣  Getting cart again to verify persistence...');
    const cartAgain = await cartService.getCart(testSessionId);
    console.log('   Items in cart:', cartAgain.items?.length);
    if (cartAgain.items && cartAgain.items.length > 0) {
      console.log('   ✅ Items persisted!');
    } else {
      console.log('   ❌ Items NOT persisted!');
    }

    // Check database directly
    console.log('\n4️⃣  Checking database directly...');
    const dbCart = await prisma.cart.findUnique({
      where: { sessionId: testSessionId },
      include: { items: true }
    });
    console.log('   Cart in DB:', { id: dbCart?.id, itemsCount: dbCart?.items?.length });
    if (dbCart?.items?.length) {
      console.log('   ✅ Items in database!');
      dbCart.items.forEach((item, i) => {
        console.log(`      CartItem ${i + 1}: variantId=${item.variantId}, qty=${item.quantity}`);
      });
    } else {
      console.log('   ❌ NO items in database!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCartFlow();
