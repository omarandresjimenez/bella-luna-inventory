# WebSockets on Vercel - Quick Fix (Polling Fallback)

## TL;DR

Vercel doesn't support WebSockets. You already have code to disable them in production. Now add HTTP polling as fallback:

### 3 Simple Steps:

#### Step 1: Create Backend Endpoint (5 minutes)

Add to `src/interface/controllers/AdminOrderController.ts` or create new file:

```typescript
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { prisma } from '../../infrastructure/database/prisma.js';

export const notificationRoutes = Router();

notificationRoutes.get('/admin/notifications', authenticateToken, async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user.id;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const unread = req.query.unread === 'true';
    
    const notifications = await prisma.notification.findMany({
      where: {
        adminId,
        ...(unread && { read: false }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    
    return res.json({ 
      success: true, 
      data: notifications || [] 
    });
  } catch (error) {
    console.error('[NotificationController] Error fetching notifications:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch notifications' 
    });
  }
});
```

Then register in `src/interface/routes/index.ts`:
```typescript
import { notificationRoutes } from '../controllers/AdminOrderController.js';
// ...
router.use(notificationRoutes);
```

#### Step 2: Update NotificationPanel Component (10 minutes)

In `frontend/src/components/admin/NotificationPanel.tsx`:

```typescript
import { usePollingNotifications } from '../../hooks/usePollingNotifications';

export default function NotificationPanel() {
  const isProduction = import.meta.env.VITE_API_URL?.includes('vercel.app');
  const { isConnected, notifications, unreadCount } = useSocket();
  
  // Use polling fallback on Vercel
  usePollingNotifications({
    onNewNotification: (notification) => {
      // Only show toast for new orders (not status updates)
      if (notification.id.startsWith('order-')) {
        // Play sound
        playNotificationSound();
        // Show toast
        showToast(notification.message);
      }
    },
    pollingInterval: 5000, // Poll every 5 seconds
  });
  
  // Rest of component stays the same...
  return (
    <Box>
      {/* Your existing notification UI */}
    </Box>
  );
}
```

#### Step 3: Deploy & Test (5 minutes)

```bash
# Build and verify
npm run build && cd frontend && npm run build

# Deploy to Vercel
vercel deploy

# Test in DevTools Console
// Should see logs indicating polling is active
```

---

## What Changed?

### Development (localhost)
- ✅ WebSockets work instantly
- ✅ Real-time notifications (<100ms)

### Production (Vercel)  
- ✅ Polling works with ~5 second delay
- ✅ No WebSocket errors
- ✅ Notifications still functional

---

## Verification

Open DevTools Console on Vercel frontend and you should see:
```
[useSocket] Production environment detected - WebSockets disabled
```

When an order is created:
- Check Network tab → polling requests to `/admin/notifications` every 5 seconds
- Within 5 seconds, notification appears (with slight delay compared to local)

---

## Polling Settings

Adjust polling interval in NotificationPanel:
- **3000ms (3 seconds)**: More frequent, more responsive, more server load
- **5000ms (5 seconds)**: Balanced (recommended)
- **10000ms (10 seconds)**: Less frequent, lower latency sensitivity

---

## If You Want Better UX Later

Deploy backend to Render (free tier) instead:
1. Go to https://render.com
2. Create Web Service from Git
3. Update `VITE_API_URL` to Render URL
4. WebSockets work instantly

See [WEBSOCKETS_VERCEL_SOLUTION.md](WEBSOCKETS_VERCEL_SOLUTION.md) for full guide.

---

**Status**: Polling hook already created (`usePollingNotifications.ts`)  
**Time to implement**: ~20 minutes  
**User experience**: Notifications with ~5 second delay on Vercel ✓
