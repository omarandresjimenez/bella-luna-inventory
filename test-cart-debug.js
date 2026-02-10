#!/usr/bin/env node

/**
 * Cart API Debug Script
 * 
 * Tests the cart API with detailed logging to identify where items are being lost
 */

const http = require('http');
const https = require('https');

const API_URL = 'http://localhost:3001';

// Test 1: Add item without sessionId (should generate new sessionId)
async function test1_AddItemNoSessionId() {
  console.log('\n' + '='.repeat(80));
  console.log('TEST 1: Add item to cart WITHOUT sessionId (anonymous user, first time)');
  console.log('='.repeat(80));
  
  try {
    const response = await makeRequest('POST', '/api/cart/items', {
      variantId: 'variant-1',
      quantity: 2
    });
    
    console.log('\nRequest:');
    console.log('  POST /api/cart/items');
    console.log('  Headers: (no X-Session-Id)');
    console.log('  Body:', { variantId: 'variant-1', quantity: 2 });
    
    console.log('\nResponse:');
    console.log('  Status:', response.status);
    console.log('  Headers:', JSON.stringify(response.headers, null, 2));
    console.log('  Body:', JSON.stringify(response.body, null, 2));
    
    if (response.body?.data?.sessionId) {
      console.log('\n✅ SessionId received:', response.body.data.sessionId);
      return response.body.data.sessionId;
    } else if (response.headers['x-session-id']) {
      console.log('\n✅ SessionId in header:', response.headers['x-session-id']);
      return response.headers['x-session-id'];
    } else {
      console.log('\n❌ NO sessionId in response!');
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Test 2: Get cart with sessionId
async function test2_GetCartWithSessionId(sessionId) {
  console.log('\n' + '='.repeat(80));
  console.log('TEST 2: Get cart WITH sessionId (should retrieve items added in test 1)');
  console.log('='.repeat(80));
  
  if (!sessionId) {
    console.log('⚠️  Skipping - no sessionId from test 1');
    return;
  }
  
  try {
    const response = await makeRequest('GET', '/api/cart', null, {
      'X-Session-Id': sessionId
    });
    
    console.log('\nRequest:');
    console.log('  GET /api/cart');
    console.log('  Headers:', { 'X-Session-Id': sessionId });
    
    console.log('\nResponse:');
    console.log('  Status:', response.status);
    console.log('  Headers:', JSON.stringify(response.headers, null, 2));
    console.log('  Body:', JSON.stringify(response.body, null, 2));
    
    if (response.body?.data?.items?.length > 0) {
      console.log('\n✅ Items retrieved:', response.body.data.items.length);
      return response.body.data;
    } else {
      console.log('\n❌ NO ITEMS in response! itemCount:', response.body?.data?.itemCount);
      return response.body.data;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Test 3: Add another item
async function test3_AddAnotherItem(sessionId) {
  console.log('\n' + '='.repeat(80));
  console.log('TEST 3: Add another item to cart WITH sessionId');
  console.log('='.repeat(80));
  
  if (!sessionId) {
    console.log('⚠️  Skipping - no sessionId');
    return;
  }
  
  try {
    const response = await makeRequest('POST', '/api/cart/items', {
      variantId: 'variant-2',
      quantity: 1
    }, {
      'X-Session-Id': sessionId
    });
    
    console.log('\nRequest:');
    console.log('  POST /api/cart/items');
    console.log('  Headers:', { 'X-Session-Id': sessionId });
    console.log('  Body:', { variantId: 'variant-2', quantity: 1 });
    
    console.log('\nResponse:');
    console.log('  Status:', response.status);
    console.log('  Body:', JSON.stringify(response.body, null, 2));
    
    if (response.body?.data?.items?.length > 0) {
      console.log('\n✅ Items in response:', response.body.data.items.length);
    } else {
      console.log('\n❌ NO ITEMS in response!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Helper function to make HTTP requests
function makeRequest(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    const protocol = url.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('\n🚀 Starting Cart API Debug Tests');
  console.log('API URL:', API_URL);
  console.log('Make sure the backend server is running on port 3001\n');
  
  const sessionId = await test1_AddItemNoSessionId();
  await test2_GetCartWithSessionId(sessionId);
  await test3_AddAnotherItem(sessionId);
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Tests complete! Check server logs for [CartService] and [CartController] messages');
  console.log('='.repeat(80) + '\n');
}

runTests().catch(console.error);
