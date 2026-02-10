# DEBUG: Empty Cart Response

To debug why the cart is returning empty items, please:

## 1. Start the server and watch logs:
```bash
npm run dev
```

## 2. Make a request to add item:
```bash
curl -X POST http://localhost:3001/api/cart/items \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: test-session-123" \
  -d '{"variantId":"<VALID_VARIANT_ID>","quantity":1}'
```

(You may need to replace `<VALID_VARIANT_ID>` with an actual variant ID from your database)

## 3. Check server console for these logs:

You should see output like:
```
[CartController.addItem] START
[CartService.addItem] START
[CartService.addItem] Got cart: { cartId: "...", sessionId: "..." }
[CartService.addItem] Creating new item: { cartId: "...", variantId: "...", ... }
[CartService.addItem] Item created: { itemId: "..." }
[CartService.addItem] Calling getCart to fetch updated cart
[CartService.getCart] START { sessionId: "...", customerId: undefined }
[CartService.getCart] Looking for session cart: ...
[CartService.getCart] Session cart found: { cartId: "...", itemsCount: 1 }  ← Should show 1!
```

## 4. KEY THINGS TO CHECK:

- **itemsCount in "Session cart found"**: Should be 1 or more, not 0
- **Item created log**: Should show the cartItem was created
- **Final result log**: Should show `itemsLength: 1`, not 0

## 5. If items are 0 in logs:

Then either:
a) CartItem is not being created (check if variantId exists)
b) Prisma query isn't loading items properly
c) There's a database transaction issue

## 6. Database direct check:

Run this command to check database state:
```bash
npx ts-node debug-cart-db.ts
```

This will show you what's actually in the database.

---

**Paste the server logs output here** so I can see exactly where items are being lost!
