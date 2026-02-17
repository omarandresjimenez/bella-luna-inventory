# Quick Vercel Deployment Steps

## 🔴 Issues Fixed

1. **Double slash in API URLs** (`/api//admin/pos/summary`)
   - Fixed by replacing direct axios calls with `apiClient`
   - File: `frontend/src/pages/admin/POSSalesReportPage.tsx`

2. **CORS errors on Vercel** (Response status 0)
   - Fixed backend CORS configuration to include Vercel domains
   - File: `src/app.ts`

3. **Environment variables not set**
   - Updated `.env.example` files with production URLs
   - Documented required Vercel configuration

## ✅ Implementation Summary

| Component | Change | Result |
|-----------|--------|--------|
| Frontend API calls | Replaced `${API_BASE}/endpoint` with `apiClient.get('/endpoint')` | No more double slashes ✓ |
| Backend CORS | Added production domain validation | Vercel requests now allowed ✓ |
| Environment vars | Updated with Vercel URLs | FRONTEND_URL now configurable ✓ |
| Build process | No changes needed | Both build successfully ✓ |

## 🚀 Deployment Instructions

### Step 1: Deploy Backend API to Vercel

```bash
cd c:\Users\omar.jimenez\Documents\personal\Antigravity\bella_luna_inventory
vercel deploy
```

Get your backend URL: `https://bella-luna-inventory-api.vercel.app`

### Step 2: Configure Backend Environment Variables

Go to Vercel Dashboard → Select backend project → Settings → Environment Variables

Add these variables:

```
FRONTEND_URL = https://bella-luna-chia.vercel.app
DATABASE_URL = postgresql://...
DIRECT_URL = postgresql://...
JWT_SECRET = (your-32-char-minimum-secret)
SUPABASE_URL = https://...supabase.co
SUPABASE_SERVICE_KEY = (your-key)
SENDGRID_API_KEY = SG.(your-key)
SENDGRID_FROM_EMAIL = noreply@yourdomain.com
NODE_ENV = production
```

### Step 3: Deploy Frontend to Vercel

```bash
cd frontend
vercel deploy
```

Get your frontend URL: `https://bella-luna-chia.vercel.app`

### Step 4: Configure Frontend Environment Variables

Go to Vercel Dashboard → Select frontend project → Settings → Environment Variables

Add this variable:

```
VITE_API_URL = https://bella-luna-inventory-api.vercel.app/api
```

### Step 5: Verify Deployment

1. **Backend health check**:
   ```bash
   curl https://bella-luna-inventory-api.vercel.app/health
   ```
   Should return: `{"status":"OK","timestamp":"..."}`

2. **Frontend loads**:
   - Navigate to `https://bella-luna-chia.vercel.app`
   - Open DevTools → Console
   - Should see no CORS errors

3. **API call works**:
   - Navigate to Admin → POS Reports
   - Should display sales data without CORS errors

## 📋 What Changed In Code

### POSSalesReportPage.tsx
```diff
- import axios from 'axios';
+ import { apiClient } from '../../services/apiClient';

- const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const { data: statsData } = useQuery({
    queryKey: ['pos-sales-stats', period],
    queryFn: async () => {
-     const response = await axios.get(`${API_BASE}/admin/pos/summary`, {
+     const response = await apiClient.get('/admin/pos/summary', {
        params: { period },
-       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.data;
    }
  });
```

### src/app.ts
```diff
- // Allow all origins
- app.use((req, res, next) => {
-   res.header('Access-Control-Allow-Origin', '*');
- });

+ const allowedOrigins = [
+   'http://localhost:5173',
+   'http://localhost:3000',
+   process.env.FRONTEND_URL || '',
+   'https://bella-luna-chia.vercel.app',
+ ].filter(origin => origin);
+ 
+ app.use((req, res, next) => {
+   const origin = req.headers.origin;
+   if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
+     res.header('Access-Control-Allow-Origin', origin || '*');
+   }
+   // ... rest of CORS headers
+ });
```

## 🧪 Local Testing Before Deployment

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Browser: Test API call
# Open http://localhost:5173
# Navigate to Admin → POS Reports
# Check DevTools Console for any CORS errors (there shouldn't be any)
```

## ⚠️ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| CORS error after deployment | Verify `FRONTEND_URL` env var is set on backend |
| 404 on API endpoints | Check `VITE_API_URL` is set correctly on frontend |
| `Double slash` still appearing | Clear browser cache and redeploy frontend |
| Blank data tables | Check browser console for errors, verify token exists |

## 📞 Support

If you see CORS errors, check:
1. Backend `FRONTEND_URL` environment variable matches your frontend domain
2. Frontend `VITE_API_URL` matches your backend domain
3. Browser cache is cleared
4. Both services are redeployed after env var changes

---

**All changes are backward compatible and don't affect local development!**
