# API Routes Structure - CLARIFICATION

## The Issue

You tried: `http://localhost:3000/auth/login`  
**Result**: ❌ Route not found

## The Solution  

The correct endpoint is: `http://localhost:3000/api/auth/login`  
**Result**: ✅ Works! (Returns 401 with "Email or password incorrect")

---

## Why?

All API routes are prefixed with `/api` in `src/app.ts`:

```typescript
// API routes
app.use('/api', routes);
```

So routes are registered as:
- `/api/auth/login` ✅
- `/api/auth/register` ✅
- `/api/admin/orders` ✅
- `/api/cart` ✅
- etc.

---

## Complete Authentication Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | Login (customer) |
| `/api/auth/register` | POST | Register (customer) |
| `/api/auth/admin/login` | POST | Login (admin) |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/refresh` | POST | Refresh token |
| `/api/auth/forgot-password` | POST | Start password reset |
| `/api/auth/reset-password` | POST | Complete password reset |
| `/api/auth/verify-email` | POST | Verify email |
| `/api/auth/resend-verification` | POST | Resend verification code |

---

## Frontend Configuration

The frontend's `apiClient` automatically adds `/api` prefix:

```typescript
// frontend/src/config/env.ts
VITE_API_URL: z.string().url('Invalid API URL')
  .default('http://localhost:3000/api')
```

So when frontend calls:
```typescript
apiClient.post('/auth/login', credentials)
```

It becomes:
```
POST http://localhost:3000/api/auth/login
```

---

## Testing Manually

### Option 1: Via curl
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'
```

### Option 2: Via browser console
```javascript
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@test.com',
    password: 'password'
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

### Option 3: Via frontend (normal way)
Just use the frontend login page - it handles all of this automatically.

---

## Summary

✅ Backend is working  
✅ Auth routes are functional  
✅ Use `/api/auth/login` not `/auth/login`  
✅ Frontend automatically adds `/api` prefix  

**Everything is configured correctly!**
