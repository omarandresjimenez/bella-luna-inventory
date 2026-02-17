# Polling Notifications - Testing Guide

## Problem Analysis

Notifications aren't working on Vercel because:

1. **WebSockets are disabled** on Vercel (serverless limitation) ✓ Expected
2. **Polling fallback is enabled** ✓ Expected
3. **BUT**: Notifications are NOT being stored for polling ✗ **The Issue**

### Root Cause
When an order is created:
- NotificationService only broadcasts via Socket.io
- NotificationController doesn't receive these notifications
- Polling endpoint returns empty array

### Solution
Need to update NotificationService to store notifications for polling as well.

---

## Quick Testing Steps

### 1. **Test Backend Endpoint Directly**

In your terminal, test if the polling endpoint works:

```bash
# Get token from your .env or login response
TOKEN="your-admin-token"

# Test the polling endpoint
curl -X GET "http://localhost:3000/api/admin/notifications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": []
}
```

### 2. **Test Polling with Browser DevTools**

1. Open your Vercel app in browser
2. Open DevTools → **Network** tab
3. Filter by "notifications" 
4. Wait 5 seconds - you should see `GET /api/admin/notifications` requests
5. Check the response:
   - **❌ If `data: []` (empty)**: Notifications not being stored
   - **✅ If `data: [...]` (has items)**: Polling is working

### 3. **Manual Polling Test Script**

Create a test file `test-polling.ts`:

```typescript
// test-polling.ts
import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';
const token = localStorage.getItem('token');

async function testPolling() {
  console.log('Testing polling endpoint...');
  
  try {
    const response = await axios.get(
      `${API_URL}/api/admin/notifications`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    console.log('✅ Polling endpoint works!');
    console.log('Notifications:', response.data);
  } catch (error: any) {
    console.log('❌ Polling endpoint error:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data);
  }
}

testPolling();
```

Run in browser console:
```javascript
// Paste this in browser console while on your admin page
fetch('/api/admin/notifications', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(d => console.log('Notifications:', d))
.catch(e => console.error('Error:', e))
```

### 4. **Enable Console Logging**

Add temporary logging to see what's happening:

In `frontend/src/hooks/usePollingNotifications.ts`, replace the fetch function:

```typescript
const fetchNotifications = useCallback(async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('[Polling] No token found');
      return;
    }

    console.log('[Polling] Fetching notifications...');
    
    const response = await apiClient.get<PollingNotification[]>('/admin/notifications', {
      params: {
        limit: 10,
        unread: true,
      },
    });

    console.log('[Polling] Response:', response.data);

    if (response.data && Array.isArray(response.data)) {
      const notifications = response.data;
      console.log(`[Polling] Got ${notifications.length} notifications`);

      notifications.forEach((notification: PollingNotification) => {
        if (!lastNotificationIdRef.current || notification.id > lastNotificationIdRef.current) {
          console.log('[Polling] New notification:', notification);
          lastNotificationIdRef.current = notification.id;
          onNewNotification?.(notification);
        }
      });
    }
  } catch (error) {
    console.error('[Polling] Error:', error);
  }
}, [onNewNotification]);
```

---

## Checklist for Debugging

- [ ] Token exists in localStorage
- [ ] Polling hook is being called (`enabled: true` in production)
- [ ] Network tab shows `/api/admin/notifications` requests every 5s
- [ ] Response status is 200 (not 401, 403, 500)
- [ ] Response contains `{ success: true, data: [...] }`
- [ ] User is an ADMIN or MANAGER role
- [ ] Backend is accessible from Vercel domain (check CORS)

---

## What Should Happen On Vercel

1. **Create an order** from customer account
2. **Switch to admin account** in another browser tab
3. **Wait 5 seconds** (polling interval)
4. **Toast notification appears** with order details
5. **Drawer auto-opens**
6. **Click "Ver"** link to view order details

If step 4 doesn't happen, check the browser console for polling errors.

---

## Environment-Specific Behavior

### Local (Socket.io)
- Order created → Notification appears **instantly**
- Network shows WebSocket connection (`wss://`)
- No polling requests in Network tab

### Vercel (Polling)
- Order created → Notification appears **after ~5 seconds**
- Network shows polling requests (`GET /api/admin/notifications`)
- No WebSocket connection

---

## Common Issues & Solutions

### Issue 1: No polling requests in Network tab
**Cause**: Polling hook not enabled
**Solution**: Check NotificationPanel.tsx line 35: `enabled: isProduction || !isConnected`
- Verify `isProduction` is detecting Vercel correctly

### Issue 2: 401 Unauthorized on polling request
**Cause**: Token not sent or expired
**Solution**: 
```javascript
// In browser console, check token:
console.log(localStorage.getItem('token'))

// Re-login if token is missing
```

### Issue 3: CORS error on polling request
**Cause**: Backend not whitelisting frontend domain
**Solution**: Check `src/app.ts` CORS configuration includes Vercel domain

### Issue 4: Polling returns empty array
**Cause**: **Notifications not being stored** ← This is the real issue
**Solution**: Need to fix NotificationService to store notifications
- See "Fix Required" section below

---

## Fix Required

The NotificationService needs to also store notifications for polling:

In `src/services/NotificationService.ts`, update `emitNewOrder()`:

```typescript
static emitNewOrder(order: any) {
  // ... existing Socket.io code ...
  
  // ALSO store for polling fallback
  const notification = {
    id: `order-${order.id}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    message: `Nueva orden #${order.orderNumber} de ${order.customer.firstName} ${order.customer.lastName}`,
    type: 'success' as const,
    customerId: order.customerId,
    customerName: `${order.customer.firstName} ${order.customer.lastName}`,
    total: order.total,
    status: order.status,
    timestamp: new Date(),
    read: false,
  };
  
  // Get all admins from database and store notification
  // For now, broadcast to all connected Socket.io admins
  this.connectedAdmins.forEach((admin) => {
    notificationController.addNotification(admin.userId, notification);
  });
}
```

---

## Testing on Local First

Test on localhost to ensure polling works before deploying:

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Browser: 
# 1. Open http://localhost:5173/admin (admin account)
# 2. Open DevTools → Console
# 3. Paste logging code from step 4 above
# 4. Force production mode by modifying NotificationPanel:
#    const isProduction = true; // Test polling manually
# 5. Create an order from another account
# 6. Check console for [Polling] logs
```

---

## Next Steps

1. ✅ **Verify polling endpoint is accessible**
   ```bash
   curl http://localhost:3000/api/admin/notifications -H "Authorization: Bearer TOKEN"
   ```

2. ⚠️ **Check if notifications are being stored**
   - Create an order
   - Check response from polling endpoint
   - If empty, need to fix NotificationService

3. 🔧 **Fix NotificationService** (if needed)
   - Store notifications in NotificationController
   - Verify admins are receiving them

4. ✅ **Test on Vercel**
   - Deploy backend
   - Deploy frontend
   - Create order
   - Check polling in Network tab

---

## Monitoring Production

On Vercel, monitor polling performance:

1. **Polling Frequency**: Every 5 seconds
   - API calls: 12 per minute per admin
   - Bandwidth: ~200 bytes per request

2. **Notification Latency**: ~5 seconds
   - Acceptable for e-commerce orders
   - Could reduce to 3 seconds if needed

3. **Server Load**:
   - Each polling request is lightweight
   - Scales well with number of admins
   - Monitor 500 errors in logs

---

## Success Criteria ✅

- [ ] `/api/admin/notifications` endpoint returns 200
- [ ] Response format: `{ success: true, data: [...] }`
- [ ] Network tab shows requests every 5 seconds in production
- [ ] New orders trigger notification within 5 seconds
- [ ] Toast appears for new orders
- [ ] Drawer auto-opens
- [ ] No CORS errors
- [ ] No 401/403 auth errors
- [ ] Console logs show polling activity
