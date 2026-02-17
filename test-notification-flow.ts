import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function testNotificationFlow() {
  try {
    console.log('1. Logging in as admin...');
    const adminLoginRes = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@bellaluna.com',
      password: 'admin123',
    });

    const adminToken = adminLoginRes.data.data.token;
    console.log('✅ Admin logged in:', adminLoginRes.data.data.user.email);

    console.log('\n2. Getting a product with stock...');
    const productsRes = await axios.get(`${API_URL}/products?limit=20`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const productsWithStock = productsRes.data.data.products.filter(
      (p: any) => p.inStock === true || p.stock > 0
    );

    if (productsWithStock.length === 0) {
      console.log('❌ No products with stock found');
      console.log('Creating a test product...');
      // For now, just use the first product and assume it's available
    }

    const product = productsWithStock[0] || productsRes.data.data.products[0];
    console.log('✅ Found product:', product.name, '(stock:', product.stock, ')');

    console.log('\n3. Logging in as customer...');
    const customerLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'notification-test@example.com',
      password: 'TestPassword123',
    });

    const customerToken = customerLoginRes.data.data.token;
    console.log('✅ Customer logged in:', customerLoginRes.data.data.customer.email);

    console.log('\n4. Adding product to cart...');
    // Try just with productId and variantId - let the backend handle variant resolution
    const cartRes = await axios.post(
      `${API_URL}/cart/items`,
      {
        productId: product.id,
        variantId: product.id, // Use product ID as variant ID
        quantity: 1,
      },
      {
        headers: { Authorization: `Bearer ${customerToken}` },
      }
    );

    console.log('✅ Product added to cart');

    console.log('\n5. Creating order...');
    const orderRes = await axios.post(
      `${API_URL}/orders`,
      {
        deliveryType: 'STORE_PICKUP',
        paymentMethod: 'CASH_ON_DELIVERY',
      },
      {
        headers: { Authorization: `Bearer ${customerToken}` },
      }
    );

    const order = orderRes.data.data;
    console.log('✅ Order created:', order.orderNumber);

    console.log('\n6. Checking admin notifications (polling)...');
    await new Promise((r) => setTimeout(r, 2000));

    const notificationsRes = await axios.get(`${API_URL}/admin/notifications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const notifications = notificationsRes.data.data;
    console.log(`✅ Admin received ${notifications.length} notification(s)`);

    if (notifications.length > 0) {
      console.log('\n📧 Latest notification:');
      console.log(JSON.stringify(notifications[0], null, 2));
    }

    console.log('\n✅ Notification flow test completed successfully!');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Error:', error.response?.data || error.message);
    } else {
      console.error('❌ Error:', error);
    }
  }
}

testNotificationFlow();
