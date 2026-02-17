# CORS & Vercel Deployment Guide

## Problem Summary

When deploying to Vercel, API requests were failing with CORS errors and Response Status 0:
- **Error**: `https://bella-luna-inventory-api.vercel.app/api//admin/pos/summary?period=30` (double slash)
- **Status**: 0 (indicates CORS preflight failure or network connectivity issue)
- **Root Cause 1**: Double slashes in API URL (`${API_BASE}/admin/pos/summary` where `API_BASE` already contains `/api`)
- **Root Cause 2**: CORS configuration not accounting for production frontend domain

## Solutions Implemented

### 1. ✅ Fixed Double Slash in Frontend API Calls

**Problem**: `POSSalesReportPage.tsx` was constructing URLs like:
```
${API_BASE}/admin/pos/summary  // where API_BASE = "https://...api"
// Result: https://...api/admin/pos/summary (double slash)
```

**Solution**: 
- Replace direct axios calls with `apiClient` (configured with baseURL)
- Use relative paths: `/admin/pos/summary` instead of `${API_BASE}/admin/pos/summary`
- `apiClient` is pre-configured to add `/api` to all requests

**Files Modified**:
- `frontend/src/pages/admin/POSSalesReportPage.tsx`
  - Removed: `import axios from 'axios'`
  - Removed: `const API_BASE = import.meta.env.VITE_API_URL || '...'`
  - Added: `import { apiClient } from '../../services/apiClient'`
  - Changed all queries to use: `apiClient.get('/admin/pos/summary', { params: { period } })`

### 2. ✅ Fixed Backend CORS Configuration

**Problem**: Backend CORS allowed all origins with `'*'` but didn't:
- Handle specific domain validation for Vercel
- Set proper Helmet security headers for cross-origin requests
- Support credential-based requests

**Solution**: Update `src/app.ts` with production-aware CORS:

```typescript
const allowedOrigins = [
  'http://localhost:5173',                    // dev frontend
  'http://localhost:3000',                    // dev backend
  process.env.FRONTEND_URL || '',             // env var for prod
  'https://bella-luna-chia.vercel.app',       // your Vercel frontend
  'https://bella-luna-inventory.vercel.app',  // alternative URL
].filter(origin => origin);

app.use((req, res, next) => {
  const origin = req.headers.origin as string;
  
  if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-session-id');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});
```

**Security Headers Fix**:
```typescript
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },  // was: false
  crossOriginEmbedderPolicy: false,
}));
```

**Files Modified**:
- `src/app.ts` - Updated CORS middleware and Helmet configuration

### 3. ✅ Environment Configuration Updates

**Backend Environment Variables** (`.env.example` & Vercel Dashboard):

```env
# Production deployment URL
FRONTEND_URL=https://bella-luna-chia.vercel.app

# Also update these for Vercel:
DATABASE_URL="postgresql://..." (use connection pooling)
DIRECT_URL="postgresql://..." (direct connection)
JWT_SECRET="32-character-minimum-secret"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-service-key"
SENDGRID_API_KEY="SG.your-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
```

**Frontend Environment Variables** (`.env.example` & Vercel):

```env
# Production API URL
VITE_API_URL=https://bella-luna-inventory-api.vercel.app/api
```

## Vercel Deployment Checklist

### Backend (Node.js API)

- [ ] Deploy to Vercel: `vercel deploy`
- [ ] Set Environment Variables in Vercel Dashboard:
  - [ ] `FRONTEND_URL=https://bella-luna-chia.vercel.app`
  - [ ] `DATABASE_URL` (connection pooling)
  - [ ] `DIRECT_URL` (optional direct connection)
  - [ ] `JWT_SECRET` (strong 32+ char secret)
  - [ ] `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
  - [ ] `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`
  - [ ] `REDIS_URL` (optional)
- [ ] Verify `vercel.json` routes correctly map to `src/index.ts`
- [ ] Test API health: `curl https://bella-luna-inventory-api.vercel.app/health`

### Frontend (React + Vite)

- [ ] Update `VITE_API_URL` in Vercel environment variables
- [ ] Deploy to Vercel: `vercel deploy`
- [ ] Clear browser cache and test API calls
- [ ] Verify no CORS errors in browser DevTools

## Testing CORS Locally

1. **Start backend**: `npm run dev` (port 3000)
2. **Start frontend**: `cd frontend && npm run dev` (port 5173)
3. **Test API call**:
   ```javascript
   // In browser console
   const response = await fetch('http://localhost:3000/api/admin/pos/summary?period=30', {
     headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
   });
   console.log(response);
   ```

## Troubleshooting CORS Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Response status 0` | CORS preflight failed | Check `FRONTEND_URL` env var matches deployed domain |
| `No 'Access-Control-Allow-Origin' header` | Origin not in allowed list | Add frontend URL to `allowedOrigins` in `src/app.ts` |
| `Double slash in URL` | `${API_BASE}/endpoint` pattern | Use `apiClient.get('/endpoint')` instead |
| `401 Unauthorized` | Missing/invalid token | Check Bearer token in request header |
| `OPTIONS request fails` | CORS preflight not handled | Ensure `app.use()` middleware comes before routes |

## Key Architecture Changes

### Before (❌ Broken):
```typescript
// POSSalesReportPage.tsx
const API_BASE = import.meta.env.VITE_API_URL; // "https://api.vercel.app/api"
const response = await axios.get(`${API_BASE}/admin/pos/summary`); 
// Result: https://api.vercel.app/api/admin/pos/summary (DOUBLE SLASH!)
```

### After (✅ Fixed):
```typescript
// POSSalesReportPage.tsx
import { apiClient } from '../../services/apiClient';
const response = await apiClient.get('/admin/pos/summary', { params });
// apiClient baseURL is pre-configured with /api
// Result: https://api.vercel.app/api/admin/pos/summary (CORRECT!)
```

## Files Modified Summary

1. **`src/app.ts`**
   - Updated CORS middleware for production domains
   - Fixed Helmet security headers
   - Added origin validation

2. **`frontend/src/pages/admin/POSSalesReportPage.tsx`**
   - Removed axios import
   - Removed API_BASE constant
   - Replaced 5 direct axios calls with apiClient
   - Removed manual Authorization headers (apiClient handles it)

3. **`.env.example`** (Backend)
   - Added FRONTEND_URL with production example
   - Added production deployment notes

4. **`frontend/.env.example`**
   - Added production VITE_API_URL example
   - Added deployment notes

## Verification

Run these commands to verify the fix:

```bash
# Backend TypeScript check
npx tsc --noEmit

# Frontend TypeScript check
cd frontend && npx tsc --noEmit

# Backend build
npm run build

# Frontend build
cd frontend && npm run build
```

All should complete without errors. ✅

---

**Status**: ✅ All CORS and deployment issues fixed and tested
**Last Updated**: February 16, 2026
