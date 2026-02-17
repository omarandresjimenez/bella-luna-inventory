# Local Testing: Polling Notifications

## Quick Start

### Step 1: Enable Polling Locally

Your `.env.local` already has:
```
VITE_FORCE_POLLING=true
```

This simulates Vercel's polling behavior locally so you can test it before deploying.

### Step 2: Start Backend
```bash
npm run dev
```

Backend should run on `http://localhost:3000`

### Step 3: Start Frontend
```bash
cd frontend
npm run dev
```

Frontend should run on `http://localhost:5173`

### Step 4: Test Polling

1. Open http://localhost:5173/admin in browser
2. Open DevTools → Network tab
3. Filter by "notifications"
4. You should see GET requests to `/api/admin/notifications` every 5 seconds

**Expected requests:**
```
GET http://localhost:3000/api/admin/notifications
Status: 200
Every: 5 seconds
```

### Step 5: Create Test Order

1. Open http://localhost:5173 (customer) in another tab
2. Create an order
3. Switch back to admin tab
4. Wait 5 seconds (or check Network tab to see polling request)
5. Notification should appear

---

## Testing Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] `.env.local` has `VITE_FORCE_POLLING=true`
- [ ] Can see polling requests in Network tab every 5s
- [ ] Create order → notification appears in 5 seconds
- [ ] Toast notification shows
- [ ] Drawer auto-opens
- [ ] Can click "Ver" to view order

---

## Debugging

### Polling requests not showing?

1. **Check DevTools Network tab**
   - Filter by "notifications"
   - Should show requests to `/api/admin/notifications`

2. **Check browser console**
   ```javascript
   // Should show true
   console.log(import.meta.env.VITE_FORCE_POLLING)
   ```

3. **Check if backend is running**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"ok"}`

4. **Check token exists**
   ```javascript
   console.log(localStorage.getItem('token'))
   ```

### Polling requests show but no data?

1. **Check response in Network tab**
   - Click the request
   - Check Response tab
   - Should show: `{ success: true, data: [...] }`

2. **Check backend logs**
   - Should see `[NotificationService]` messages
   - Should see "Polling notification stored"

3. **Check user role**
   - Must be logged in as admin
   - Must have ADMIN or MANAGER role

### Notification appears with WebSocket but not polling?

This is expected! The issue was notifications weren't being stored. 

If you see the notification with WebSocket:
- Frontend sees WebSocket is connected
- Doesn't use polling (`!isConnected` is false)
- WebSocket takes priority

To test BOTH:
1. **Option A**: Disable WebSocket
   - Stop backend: Ctrl+C
   - Notification uses polling
   - Restart backend to compare

2. **Option B**: Disconnect from WebSocket manually
   - Open DevTools → Network tab
   - Find WebSocket connection
   - Right-click → Close connection
   - Polling will take over

---

## How It Works

### Local with VITE_FORCE_POLLING=true
```
Order Created
  ↓
Stored in backend memory
  ↓
Frontend polls every 5 seconds
  ↓
GET /api/admin/notifications
  ↓
Notification appears (~5 seconds)
```

### Local without VITE_FORCE_POLLING
```
Order Created
  ↓
Broadcast via WebSocket
  ↓
Frontend receives instantly
  ↓
Notification appears (instant)
```

### Production on Vercel
```
Order Created
  ↓
Stored in backend memory
  ↓
Frontend polls every 5 seconds
  ↓
GET /api/admin/notifications
  ↓
Notification appears (~5 seconds)
```

---

## Environment Variables

### `.env.local` (Local Testing)
```
VITE_FORCE_POLLING=true        # Enable polling for testing
VITE_API_URL=http://localhost:3000
```

### `.env.production` (Vercel)
```
VITE_FORCE_POLLING=false       # Use auto-detection (not needed)
VITE_API_URL=https://your-backend.vercel.app
```

### Auto-Detection
- If `VITE_FORCE_POLLING=true`: Use polling
- Else if Vercel domain detected: Use polling
- Else if WebSocket not connected: Use polling
- Else: Use WebSocket

---

## Commands

```bash
# Start backend
npm run dev

# Start frontend with polling enabled
cd frontend
npm run dev

# Build frontend with polling enabled
npm run build

# Reset to normal development
# Edit .env.local and set VITE_FORCE_POLLING=false
```

---

## Performance During Local Testing

- Polling interval: 5 seconds
- Network requests: Every 5 seconds
- Data per request: ~200 bytes
- CPU impact: Minimal
- Memory impact: Minimal

Safe to run polling continuously locally.

---

## When Ready to Deploy

### Option 1: Direct to Vercel (No Changes Needed)
```bash
# Push code with VITE_FORCE_POLLING in .env.local
# Vercel ignores .env.local (uses .env.production)
# Production auto-detects polling via domain check
```

### Option 2: Disable Flag Locally First
```bash
# Edit .env.local
VITE_FORCE_POLLING=false

# Run locally to verify WebSocket still works
# This is the default behavior

# Deploy to Vercel
```

---

## Success Indicators ✅

When testing locally with `VITE_FORCE_POLLING=true`:

✅ GET requests to `/api/admin/notifications` every 5 seconds  
✅ Status code 200 with data  
✅ New orders create notifications  
✅ Toast appears  
✅ Drawer auto-opens  
✅ ~5 second delay is acceptable  

---

## Next Steps

1. **Start backend**: `npm run dev`
2. **Start frontend**: `cd frontend && npm run dev`
3. **Test polling**: Create order, wait 5 seconds
4. **Verify**: Check Network tab shows requests
5. **Deploy**: Push to Vercel when ready

All changes are backward compatible. If you disable `VITE_FORCE_POLLING`, it uses WebSocket locally (normal behavior).

---

**Note**: `.env.local` is ignored by Vercel, so you don't need to worry about this flag affecting production deployment.
