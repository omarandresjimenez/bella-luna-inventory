# Quick Local Polling Test - 5 Minutes

## Setup

Your `.env.local` is already configured with:
```
VITE_FORCE_POLLING=true
```

This enables polling locally for testing.

## Start Services

**Terminal 1 - Backend:**
```bash
npm run dev
```
Wait for: `Server running on port 3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Wait for: `http://localhost:5173`

## Test Steps (3 minutes)

### 1. Open Admin Page
- Go to http://localhost:5173/admin
- Login with admin account

### 2. Monitor Polling Requests
- Open DevTools (F12)
- Go to **Network** tab
- Filter by "notifications"
- You should see requests every 5 seconds

### 3. Create Test Order
- Open http://localhost:5173 in another tab
- Go to products
- Add item to cart
- Checkout
- Switch back to admin tab

### 4. Wait and Observe
- Wait 5 seconds
- Check if notification appears
- Toast should show
- Drawer should open
- Check Network tab shows polling request with data

## Expected Results

```
✅ Network shows GET /api/admin/notifications every 5 seconds
✅ Status: 200
✅ Response: { success: true, data: [{...notification...}] }
✅ Notification appears in admin panel
✅ Toast message shows "Nueva orden #ORD-123..."
✅ Drawer auto-opens
```

## Console Check (Optional)

In browser console:
```javascript
// Should be true
console.log(import.meta.env.VITE_FORCE_POLLING)

// Should show polling requests working
fetch('/api/admin/notifications', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(d => console.log('Notifications:', d.data))
```

## If It Doesn't Work

### Polling requests not showing?
1. Check Network filter is set to "notifications"
2. Check backend is running (port 3000)
3. Check browser console for errors

### Requests show but no data?
1. Check backend logs for `[NotificationService]` messages
2. Verify you're logged in as admin
3. Re-login if token might be expired

### Notification appears instantly?
This means WebSocket is working (normal)! 
- To test polling: Stop backend, it will use polling as fallback

---

## Comparison: Local vs Vercel

### Local (with VITE_FORCE_POLLING=true)
- Polling: ✅ Working
- WebSocket: ✅ Also working (uses WebSocket first)
- Notification delay: 2-5 seconds (via polling)

### Vercel (auto-detected)
- Polling: ✅ Working
- WebSocket: ❌ Disabled (serverless limitation)
- Notification delay: 2-5 seconds (via polling only)

---

## Quick Decision Tree

```
Did notification appear after 5 seconds?
├─ YES → ✅ Polling works! Ready for Vercel
├─ NO
│  ├─ Check if polling requests in Network tab?
│  │  ├─ YES → Response might be empty, check backend logs
│  │  └─ NO → Polling not enabled, check VITE_FORCE_POLLING
│  └─ Got error? Check browser console
```

---

**That's it! If all checks pass, you're ready to deploy to Vercel.** 🚀
