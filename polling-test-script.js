// Quick Polling Test Script
// Paste this in browser console on your admin page to test polling

console.log('🧪 Starting Polling Notifications Test...\n');

const API_URL = window.location.origin;
const token = localStorage.getItem('token');

if (!token) {
  console.error('❌ No token found. Please login first.');
} else {
  console.log('✅ Token found:', token.substring(0, 20) + '...\n');
  
  // Test 1: Check if polling endpoint is accessible
  console.log('📡 Test 1: Testing polling endpoint...');
  fetch(`${API_URL}/api/admin/notifications`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(r => {
    console.log(`   Status: ${r.status}`);
    if (r.status === 401) {
      console.error('   ❌ Unauthorized - Token might be expired');
    } else if (r.status === 403) {
      console.error('   ❌ Forbidden - User might not be admin');
    } else if (r.status === 200) {
      console.log('   ✅ Endpoint is accessible');
    }
    return r.json();
  })
  .then(data => {
    console.log(`   Response:`, data);
    if (data.success && Array.isArray(data.data)) {
      console.log(`   ✅ Got ${data.data.length} notifications`);
      if (data.data.length > 0) {
        console.log('   First notification:', data.data[0]);
      }
    }
  })
  .catch(e => {
    console.error(`   ❌ Error:`, e.message);
    if (e.message.includes('CORS')) {
      console.error('   CORS Error - Backend CORS not configured for this domain');
    }
  });
  
  // Test 2: Check NotificationPanel hook status
  console.log('\n📱 Test 2: Checking NotificationPanel status...');
  
  // Find React component in DOM
  const adminElement = document.querySelector('[class*="NotificationPanel"]') || document.querySelector('[role="button"][aria-label*="notification" i]');
  if (adminElement) {
    console.log('✅ NotificationPanel found in DOM');
  } else {
    console.log('⚠️  NotificationPanel element not found - might be hidden');
  }
  
  // Test 3: Monitor polling requests
  console.log('\n⏱️  Test 3: Monitoring polling requests for 30 seconds...');
  console.log('📊 Opening Network tab to see requests...');
  console.log('   Expected: GET /api/admin/notifications every 5 seconds');
  console.log('   Filter by: admin/notifications');
  
  // Test 4: Create test notification
  console.log('\n🔔 Test 4: Checking if notifications are being received...');
  console.log('   Create a test order from a customer account');
  console.log('   Then switch back to admin');
  console.log('   Wait 5 seconds for notification to appear');
  
  // Test 5: Check browser storage
  console.log('\n💾 Test 5: Browser Storage Check:');
  console.log('   localStorage.getItem("token"):', token ? '✅ Set' : '❌ Missing');
  console.log('   localStorage.getItem("user"):', localStorage.getItem('user') ? '✅ Set' : '⚠️ Missing');
  
  console.log('\n✨ Polling Test Ready!');
  console.log('---\nNext Steps:');
  console.log('1. Check "Network" tab for polling requests');
  console.log('2. Create an order from customer account');
  console.log('3. Switch to admin tab');
  console.log('4. Wait 5 seconds');
  console.log('5. Check if notification appears');
}
