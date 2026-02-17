# Polling Flow Diagram

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL PRODUCTION                         │
└─────────────────────────────────────────────────────────────────┘

CUSTOMER ACCOUNT              ADMIN ACCOUNT
┌──────────────┐             ┌──────────────┐
│   Browser    │             │   Browser    │
│              │             │  (Polling)   │
└──────────────┘             └──────────────┘
       │                             │
       │ 1. Create Order             │
       │──────────────────────→      │
       │                             │
       │                        2. Poll every 5s
       │                        ──────────────→
       │                             │
       │                      GET /api/admin/notifications
       │                        Headers: { Authorization: Bearer TOKEN }
       │                             │
       │                        ┌────▼───────┐
       │                        │   Vercel    │
       │                        │   Backend   │
       │                        └────┬───────┘
       │                             │
       │                        3. Query notifications
       │                        in-memory storage
       │                             │
       │                        4. Return stored
       │                        notifications
       │                             │
       │                        Response:
       │                        {
       │                          success: true,
       │                          data: [{
       │                            id: "order-123",
       │                            orderId: "123",
       │                            message: "New order...",
       │                            type: "success",
       │                            timestamp: ...
       │                          }]
       │                        }
       │                             │
       │                        5. Show in UI
       │                        - Toast notification
       │                        - Auto-open drawer
       │                        - Badge count update
       │
       │ No WebSocket              Polling flow
       │ (disabled on             (5 second delay)
       │  Vercel)                 

```

## Data Flow: Order Creation to Notification

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORDER CREATED ON CUSTOMER                    │
└──────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                  POST /api/orders/create
                  OrderController.createOrder()
                                │
                                ▼
                 ✓ Order saved to database
                 ✓ Stock decremented
                                │
                                ▼
              NotificationService.emitNewOrder()
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
            ┌──────────────┐      ┌──────────────────┐
            │ WebSocket    │      │ Polling Storage  │
            │ (Local dev)  │      │ (Vercel prod)    │
            └──────┬───────┘      └────────┬─────────┘
                   │                       │
        Broadcast: socket.emit()    Store: notificationController
        To all connected admin       .addNotification(adminId, data)
        sockets (instant)            Stores in memory Map
                   │                       │
        Admin receives         ┌───────────┘
        instantly             │
        Socket.io event       └─→ Later, when admin polls:
                                  GET /api/admin/notifications
                                  Returns stored data
                                  (with ~5 second delay)
                   │                       │
                   └───────────┬───────────┘
                               │
                               ▼
                      Add to NotificationContext
                      via addNotification()
                               │
                               ▼
                    ┌──────────────────────────────┐
                    │   NotificationPanel renders  │
                    │   - Toast (6 sec auto-close) │
                    │   - Drawer auto-opens        │
                    │   - Bell icon badge updates  │
                    │   - Unread count increases   │
                    └──────────────────────────────┘
```

## Polling Mechanism (5 Second Cycle)

```
usePollingNotifications Hook

┌───────────────────────────────────────────────┐
│ Interval: setInterval(fetchNotifications, 5s) │
└───────┬───────────────────────────────────────┘
        │
        ▼
    ┌─────────────┐
    │ Fetch Start │
    └─────┬───────┘
          │
          ▼
  Get token from localStorage
  │
  ├─ No token? → Return (skip)
  │
  └─ Has token → Continue
          │
          ▼
  GET /api/admin/notifications?limit=10&unread=true
  Headers: {
    Authorization: Bearer <token>,
    Content-Type: application/json
  }
          │
          ▼
  ┌─────────────────────┐
  │ Response Received   │
  │ Status: 200         │
  │ Body: JSON data     │
  └────────┬────────────┘
           │
           ▼
  Process each notification:
  │
  ├─ Track lastNotificationId
  ├─ Compare IDs to avoid duplicates
  ├─ Call onNewNotification() callback
  │
  └─ Transform to NotificationContext format:
     {
       id: "order-123",
       orderId: "123",
       orderNumber: "ORD-001",
       message: "New order from John Doe",
       type: "success",
       customerId: "cust-123",
       customerName: "John Doe",
       total: 99.99,
       status: "pending",
       timestamp: new Date(),
       read: false
     }
           │
           ▼
  addNotification(transformed)
  │ Updates NotificationContext
  │ Triggers React re-render
  │
  └─→ UI Updates:
      - Toast notification appears
      - Drawer auto-opens
      - Unread count badge updates
           │
           ▼
   Wait 5 seconds
   │
   └─→ Repeat cycle...
```

## Storage Mechanism

```
┌───────────────────────────────────────────────┐
│ NotificationController.ts (Backend)           │
│                                               │
│ const adminNotifications = Map<userId, []>    │
│                                               │
│ When order created:                           │
│ notificationController.addNotification(       │
│   "admin-user-id",                            │
│   {                                           │
│     id: "order-123",                          │
│     orderId: "123",                           │
│     message: "New order...",                  │
│     ...                                       │
│   }                                           │
│ )                                             │
│                                               │
│ When polling:                                 │
│ GET /api/admin/notifications                 │
│ → Returns adminNotifications.get(userId)     │
│ → Limited to last 10 notifications           │
│                                               │
│ Memory: ~100-500 bytes per notification      │
│ Max stored: 10 per admin (cleared on new)    │
└───────────────────────────────────────────────┘
```

## Environment Detection

```
┌─────────────────────────────────────────────────────────┐
│ NotificationPanel.tsx                                   │
│                                                         │
│ const isProduction = import.meta.env.VITE_API_URL       │
│   ?.includes('vercel.app')                              │
│                                                         │
│ usePollingNotifications({                               │
│   enabled: isProduction || !isConnected                 │
│ })                                                      │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼────────┐   ┌────────▼──────┐
   │ Local Dev   │   │  Vercel Prod  │
   │ (localhost) │   │ (vercel.app)  │
   └────┬────────┘   └────────┬──────┘
        │                     │
        ▼                     ▼
   isProduction = false   isProduction = true
        │                     │
        ▼                     ▼
   Polling enabled = false   Polling enabled = true
   (only if WebSocket        (polling always runs)
    disconnects)             │
        │                    ▼
        ▼                Uses polling endpoint
   Uses Socket.io            │
   (instant)              5 second delay
                          (acceptable)
```

## Error Handling Flow

```
┌──────────────────────────────┐
│ usePollingNotifications      │
│ Error handling               │
└────────┬─────────────────────┘
         │
         ▼
    try {
      fetchNotifications()
    } catch (error) {
      // Silently ignore polling errors
      console.error('[Polling] Error:', error)
      │
      ├─ Network error?
      │  → Connection will retry in 5s
      │
      ├─ 401 Unauthorized?
      │  → Token expired, need re-login
      │
      ├─ 403 Forbidden?
      │  → User not admin/manager
      │
      ├─ 500 Server error?
      │  → Backend issue, check logs
      │
      └─ CORS error?
         → Domain not whitelisted
    }
         │
         ▼
    Polling continues despite errors
    User won't see broken notifications
    Just delayed notification on retry
```

## Comparison: WebSocket vs Polling

```
┌──────────────────────────────────────┬──────────────────────────────────┐
│         WebSocket (Local)            │       Polling (Vercel)           │
├──────────────────────────────────────┼──────────────────────────────────┤
│ Latency: < 100ms (instant)           │ Latency: 2-5 seconds             │
│ Connection: Persistent               │ Connection: Stateless HTTP       │
│ Server push: YES                      │ Server push: NO                  │
│ API calls: 1 (connection)             │ API calls: 12/min per admin      │
│ Memory: Higher                        │ Memory: Lower                    │
│ Bandwidth: Lower                      │ Bandwidth: Higher (~3.5MB/mo)    │
│ Failure handling: Manual reconnect    │ Failure handling: Auto retry     │
│ Complexity: Higher                    │ Complexity: Lower                │
│ Supported by Vercel: NO ✗             │ Supported by Vercel: YES ✓       │
│ Supported locally: YES ✓              │ Supported locally: YES ✓         │
└──────────────────────────────────────┴──────────────────────────────────┘

The app automatically uses WebSocket locally (instant)
and switches to polling on Vercel (5 second delay).
No code changes needed when switching environments!
```

---

**This is the notification flow. Key point: NotificationService now stores notifications for BOTH WebSocket and polling.**
