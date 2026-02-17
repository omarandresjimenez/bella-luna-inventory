# Environment Variable Control for Polling

## What Changed

Added `VITE_FORCE_POLLING` environment variable to control polling locally.

## Files Modified

```
✅ frontend/.env.local (NEW)
   VITE_FORCE_POLLING=true
   VITE_API_URL=http://localhost:3000

✅ frontend/src/components/admin/NotificationPanel.tsx
   Added: const forcePolling = import.meta.env.VITE_FORCE_POLLING === 'true';
   Updated: enabled: forcePolling || isProduction || !isConnected
```

## How To Use

### Test Polling Locally (5 minute test)

```bash
# .env.local already has VITE_FORCE_POLLING=true

# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend with polling
cd frontend && npm run dev

# Open http://localhost:5173/admin
# Create an order
# Wait 5 seconds
# See notification appear with polling behavior
```

### Normal Development (WebSocket)

```bash
# Option 1: Edit .env.local
VITE_FORCE_POLLING=false

# Option 2: Delete .env.local
rm frontend/.env.local

# Then start normally (uses WebSocket)
npm run dev
cd frontend && npm run dev
```

## Behavior

| Flag | Environment | Behavior |
|------|---|---|
| `VITE_FORCE_POLLING=true` | Local | Use polling (5 sec delay) |
| Not set / false | Local | Use WebSocket (instant) |
| Auto-detected | Vercel | Use polling (5 sec delay) |

## Test All Three Modes

### Mode 1: Local WebSocket (Normal)
```bash
# .env.local: VITE_FORCE_POLLING=false
npm run dev
cd frontend && npm run dev

# Result: Instant notifications via WebSocket
```

### Mode 2: Local Polling (Test Vercel)
```bash
# .env.local: VITE_FORCE_POLLING=true
npm run dev
cd frontend && npm run dev

# Result: ~5 second notifications via polling
```

### Mode 3: Vercel Polling (Production)
```bash
# Deploy to Vercel
# Auto-detects Vercel domain

# Result: ~5 second notifications via polling
```

---

## Verification

```javascript
// In browser console

// Check if polling is enabled
console.log('Polling forced:', import.meta.env.VITE_FORCE_POLLING)

// Check API URL
console.log('API URL:', import.meta.env.VITE_API_URL)

// Test polling endpoint
fetch('/api/admin/notifications', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(d => console.log('Notifications:', d.data))
```

---

## Summary

✅ Polling can be tested locally via `VITE_FORCE_POLLING=true`  
✅ Normal development uses WebSocket (instant)  
✅ Vercel auto-detects and uses polling  
✅ `.env.local` ignored by Vercel (safe for testing)  
✅ No changes needed between environments  

**Next Step**: Run local test as described in `QUICK_POLLING_TEST.md`
