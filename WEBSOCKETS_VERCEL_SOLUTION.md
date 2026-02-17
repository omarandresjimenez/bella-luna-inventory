# WebSockets on Vercel - Solution Guide

## ⚠️ The Problem

**Vercel serverless functions don't support WebSockets** because they're request/response based - they can't maintain persistent connections that WebSockets require.

Your current setup:
- ✅ Local development: WebSockets work (Socket.io on port 3000)
- ❌ Vercel production: WebSockets fail (no persistent connections allowed)

## ✅ Solutions

### **Option 1: Use Polling (Recommended - Simplest)**

Instead of WebSockets on Vercel, use HTTP polling with fallback:

**Frontend** - Use `usePollingNotifications` hook when WebSockets unavailable:

```typescript
// In NotificationPanel or similar component
import { usePollingNotifications } from '../hooks/usePollingNotifications';

export function NotificationPanel() {
  const isProduction = import.meta.env.VITE_API_URL?.includes('vercel.app');
  
  // Use polling on production (Vercel)
  usePollingNotifications({
    onNewNotification: (notification) => {
      // Handle new notification (show toast, etc.)
    },
    pollingInterval: 5000, // Check every 5 seconds
  });
  
  // Use WebSockets in development
  if (!isProduction) {
    const { isConnected, notifications } = useSocket();
    // ... rest of component
  }
}
```

**Backend** - Add notification endpoint (if not exists):

```typescript
// In src/interface/controllers/NotificationController.ts
@Get('/notifications')
async getNotifications(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 10;
    const unread = req.query.unread === 'true';
    
    const notifications = await prisma.notification.findMany({
      where: {
        adminId: userId,
        ...(unread && { read: false }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    
    return res.json({ success: true, data: notifications });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
```

**Polling Characteristics**:
- ✅ Works everywhere (Vercel, traditional servers, etc.)
- ✅ Simple to implement
- ❌ Higher latency (5-10 sec delay vs WebSockets)
- ❌ More server load (more HTTP requests)

---

### **Option 2: Deploy Backend Separately (Most Flexible)**

Deploy your Node.js backend to a platform that **supports WebSockets**:

#### Deploy Backend to Render (Free Tier Available)

1. **Create Render account**: https://render.com
2. **Connect Git repository**
3. **Create Web Service**:
   - Runtime: Node
   - Build command: `npm install && npm run build`
   - Start command: `npm run dev`
   - Environment: Production
4. **Add environment variables**:
   ```
   FRONTEND_URL=https://bella-luna-chia.vercel.app
   DATABASE_URL=postgresql://...
   NODE_ENV=production
   (... all other vars)
   ```
5. **Update Frontend** `VITE_API_URL`:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

**Render Setup Details**:
- Free tier: 750 hours/month (enough for 1 service 24/7)
- Automatic SSL/HTTPS
- WebSockets fully supported
- Can use same database (Supabase)

#### Alternative Platforms:
- **Railway**: https://railway.app (similar to Render)
- **Heroku**: https://heroku.com (paid, but reliable)
- **Fly.io**: https://fly.io (good for WebSockets)

**Benefits**:
- ✅ Full WebSocket support
- ✅ No changes to your code
- ✅ Socket.io works exactly as coded
- ✅ Low latency, real-time notifications
- ❌ Need to manage 2 deployments (backend + frontend)

---

### **Option 3: Use a WebSocket Service**

Use a managed WebSocket service like:

- **Socket.io Cloud**: https://socket.io/docs/socket-io-cloud/
- **Pusher**: https://pusher.com
- **Ably**: https://ably.com
- **Firebase Realtime Database**: https://firebase.google.com

**How it works**:
1. Your backend publishes events to the service
2. Service broadcasts to all connected clients
3. Frontend subscribes to events

**Example with Pusher**:
```typescript
// Backend
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
});

// When order created:
pusher.trigger('orders', 'new-order', { orderId, customerName, total });
```

```typescript
// Frontend
import Pusher from 'pusher-js';

const pusher = new Pusher(process.env.VITE_PUSHER_KEY, {
  cluster: process.env.VITE_PUSHER_CLUSTER,
});

const channel = pusher.subscribe('orders');
channel.bind('new-order', (data) => {
  // Handle new order notification
});
```

**Benefits**:
- ✅ Works everywhere (including Vercel)
- ✅ Scales automatically
- ✅ Low latency
- ❌ Paid service (unless using free tier)
- ❌ Need to refactor Socket.io → Pusher

---

## 🎯 Recommended Approach

### **For Your Use Case (Admin Notifications)**

**Hybrid Strategy**:
1. **Local Development**: Keep WebSockets (works perfectly)
2. **Vercel Production**: Use HTTP Polling (simple fallback)
3. **Future**: Deploy backend to Render for full WebSocket support

**Implementation Steps**:

#### Step 1: Add Polling Fallback to NotificationPanel
```typescript
import { useSocket } from '../hooks/useSocket';
import { usePollingNotifications } from '../hooks/usePollingNotifications';

export function NotificationPanel() {
  const isProduction = import.meta.env.VITE_API_URL?.includes('vercel.app');
  
  // On production, use polling
  usePollingNotifications({
    onNewNotification: (notification) => {
      // Add to notifications list, play sound, show toast
    },
    pollingInterval: 5000,
  });
  
  // In development, use WebSockets
  if (!isProduction) {
    const { isConnected, notifications } = useSocket();
    // ... use Socket.io notifications
  }
}
```

#### Step 2: Add Backend Notification Endpoint
Create `/api/admin/notifications` GET endpoint that returns recent notifications

#### Step 3: Test Both Paths
- Local: WebSockets work instantly
- Vercel: Polling shows notifications with ~5 sec delay

---

## 🚀 Vercel WebSocket Alternatives Comparison

| Solution | Ease | Cost | Latency | Code Changes |
|----------|------|------|---------|--------------|
| **Polling** | ⭐⭐⭐⭐⭐ | Free | 5-10s | Minor (1 endpoint) |
| **Backend on Render** | ⭐⭐⭐⭐ | Free | <100ms | None |
| **Pusher/Ably** | ⭐⭐⭐ | Paid | <100ms | Major (replace Socket.io) |
| **Socket.io Cloud** | ⭐⭐⭐ | Paid | <100ms | Major (refactor) |

---

## 📋 What's Already Done

- [x] `src/index.ts`: Disables Socket.io in production (`NODE_ENV !== 'production'`)
- [x] `frontend/src/hooks/useSocket.ts`: Detects production and skips Socket.io
- [x] `frontend/src/hooks/usePollingNotifications.ts`: New polling hook (ready to use)

## 🔧 Implementation Checklist

### For Polling Fallback (Recommended - 30 mins):
- [ ] Create notification endpoint: `GET /api/admin/notifications`
- [ ] Update NotificationPanel to use `usePollingNotifications`
- [ ] Test on local and verify polling works
- [ ] Deploy to Vercel and test
- [ ] Adjust polling interval if needed

### For Separate Backend Deployment (Better UX - 1-2 hours):
- [ ] Create Render account
- [ ] Connect Git repository
- [ ] Configure environment variables
- [ ] Deploy Node.js backend
- [ ] Update `VITE_API_URL` to Render URL
- [ ] Verify WebSockets work
- [ ] Test notifications with instant delivery

---

## 📌 Current Architecture

```
Development (localhost):
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend  │◄───────►│   Backend    │        │  Database    │
│  localhost  │  Sockets│  localhost   │◄──────►│  (Supabase)  │
│   5173      │         │  3000        │        │              │
└─────────────┘         └──────────────┘        └──────────────┘

Production (Current - Vercel):
┌──────────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend       │  HTTP   │   Backend    │         │  Database    │
│  bella-luna-     │◄───────►│ bella-luna-  │◄──────►│  (Supabase)  │
│  chia.vercel.app │         │ api.vercel   │        │              │
└──────────────────┘         └──────────────┘        └──────────────┘
                             (No persistent connections!)

Production (Recommended - After Render):
┌──────────────────┐     HTTP    ┌──────────────┐         ┌──────────────┐
│   Frontend       │◄───────┐    │   Backend    │         │  Database    │
│  bella-luna-    │         └───►│  on Render   │◄──────►│  (Supabase)  │
│  chia.vercel.app│  WebSockets  │  .onrender.  │        │              │
└──────────────────┘             │     com      │        └──────────────┘
                                └──────────────┘
                        (Full persistent connections!)
```

---

## 🎓 Key Takeaway

**Vercel is for serverless functions (request/response).**  
**WebSockets need persistent connections (long-lived servers).**

Choose based on your needs:
- **Need instant notifications?** → Deploy backend separately
- **Can wait 5-10 seconds?** → Use polling (free, simple)
- **Need enterprise reliability?** → Use managed WebSocket service
