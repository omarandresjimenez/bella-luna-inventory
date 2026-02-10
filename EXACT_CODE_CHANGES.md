# 🔧 EXACT CODE CHANGES

## File: src/application/services/CartService.ts

### Change 1: Line ~318 in addItem() method

**OLD CODE:**
```typescript
    console.log('[CartService.addItem] Calling getCart to fetch updated cart');
    const result = await this.getCart(sessionId, customerId);
    console.log('[CartService.addItem] Final result:', { itemCount: result.itemCount, itemsLength: result.items?.length });
    return result;
```

**NEW CODE:**
```typescript
    console.log('[CartService.addItem] Calling getCart to fetch updated cart');
    // IMPORTANT: Use cart.sessionId if no sessionId was provided, so we get the right cart back
    const cartSessionId = sessionId || cart.sessionId || undefined;
    const result = await this.getCart(cartSessionId, customerId);
    console.log('[CartService.addItem] Final result:', { itemCount: result.itemCount, itemsLength: result.items?.length });
    return result;
```

**What Changed:**
- Line added: `const cartSessionId = sessionId || cart.sessionId || undefined;`
- Changed call from `getCart(sessionId, ...)` to `getCart(cartSessionId, ...)`

---

### Change 2: Line ~366 in updateItem() method

**OLD CODE:**
```typescript
    }

    return this.getCart(sessionId, customerId);
  }
```

**NEW CODE:**
```typescript
    }

    // IMPORTANT: Use cart.sessionId if no sessionId was provided
    const cartSessionId = sessionId || cart.sessionId || undefined;
    const result = await this.getCart(cartSessionId, customerId);
    console.log('[CartService.updateItem] Final result:', { itemCount: result.itemCount, itemsLength: result.items?.length });
    return result;
  }
```

**What Changed:**
- Added cart.sessionId handling with: `const cartSessionId = sessionId || cart.sessionId || undefined;`
- Added logging for debugging
- Return the properly fetched result

---

### Change 3: Line ~400 in removeItem() method

**OLD CODE:**
```typescript
    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(sessionId, customerId);
  }
```

**NEW CODE:**
```typescript
    console.log('[CartService.removeItem] Deleting item:', { itemId });
    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    // IMPORTANT: Use cart.sessionId if no sessionId was provided
    const cartSessionId = sessionId || cart.sessionId || undefined;
    const result = await this.getCart(cartSessionId, customerId);
    console.log('[CartService.removeItem] Final result:', { itemCount: result.itemCount, itemsLength: result.items?.length });
    return result;
  }
```

**What Changed:**
- Added logging before delete
- Added cart.sessionId handling with: `const cartSessionId = sessionId || cart.sessionId || undefined;`
- Added logging after operation
- Return the properly fetched result

---

## Summary of Changes

| Change | Method | Line | Type |
|--------|--------|------|------|
| Add cartSessionId logic | addItem() | ~318 | Bug Fix |
| Add cartSessionId logic | updateItem() | ~366 | Bug Fix |
| Add cartSessionId logic | removeItem() | ~400 | Bug Fix |
| Add logging | All 3 methods | Various | Debugging |
| Update interface | CartWithItems | ~24 | TypeScript |

---

## One-Line Summary

**Add `const cartSessionId = sessionId || cart.sessionId || undefined;` and use it instead of `sessionId` when calling getCart() after modifying items.**

---

## How to Apply

1. Open `src/application/services/CartService.ts`
2. Find `addItem()` method (around line 250-320)
3. Before `return this.getCart(sessionId, customerId);` add:
   ```typescript
   const cartSessionId = sessionId || cart.sessionId || undefined;
   ```
4. Change `return this.getCart(sessionId, customerId);` to `return this.getCart(cartSessionId, customerId);`
5. Repeat steps 2-4 for `updateItem()` and `removeItem()` methods
6. Save and test

---

## Why This Works

- **Before Fix**: `getCart(undefined, undefined)` creates a new cart
- **After Fix**: `getCart(sessionId-from-cart, undefined)` retrieves the existing cart with items

The key insight: We need to preserve the sessionId that was auto-generated or passed in throughout the operation.
