# Cart Response Debug Test

Let me trace through the exact flow to identify where items are being lost.

## Expected Flow:

1. **Frontend calls**: POST /cart/items with { variantId, quantity }
2. **Backend CartController.addItem()**:
   - Validates request ✅
   - Gets sessionId from headers
   - Calls cartService.addItem(data, sessionId, customerId)
   
3. **Backend CartService.addItem()**:
   - Calls getCartEntity(sessionId, customerId) - gets basic cart
   - Creates cartItem in database ✅
   - Calls getCart(sessionId, customerId) to fetch updated cart WITH items
   
4. **Backend CartService.getCart()**:
   - Queries cart with include: { items: { include: { variant: ... } } }
   - Should return cart with items populated
   - Calls transformCartResponse() to format data
   
5. **transformCartResponse()**:
   - Maps cart.items to CartItemResponse[]
   - Returns { id, items: [...], subtotal, itemCount, sessionId }
   
6. **Backend CartController.addItem()** (response):
   - Calls setSessionIdHeaderFromCart() to set X-Session-Id header
   - Calls sendSuccess(res, cart) to return cart data
   
7. **Frontend receives response**:
   - Gets X-Session-Id from headers via response interceptor
   - Stores it via setSessionId()
   - Gets cart data in response.data.data
   - Context/React Query updates with new cart

## Potential Issues:

### Issue 1: Items not being saved to database
- Check: Are cartItem records actually being created?
- Test: Query database directly

### Issue 2: getCart() query not including items
- Check: Is the include statement correct?
- Test: Add console.log to see what's returned

### Issue 3: transformCartResponse() not mapping items
- Check: Is cart.items populated?
- Test: Add console.log before mapping

### Issue 4: Frontend not receiving items in response
- Check: Is response.data.data.items populated?
- Test: Add console.log in response interceptor

### Issue 5: SessionId mismatch
- Check: Is sessionId being used correctly?
- Scenario A: First request creates new sessionId, frontend doesn't capture it
- Scenario B: Second request uses different sessionId, queries different cart

## Root Cause Hypothesis:

Looking at the code, I notice:
- `getCart()` properly includes items with deep relations
- `addItem()` -> `getCart()` -> `transformCartResponse()` should work
- **BUT**: If there's a sessionId mismatch between requests, it could create multiple carts!

For example:
1. Request 1 (no X-Session-Id header):
   - Backend creates NEW sessionId
   - Creates cartItem
   - Returns sessionId in header
   
2. Frontend stores sessionId
   
3. Request 2 (with X-Session-Id header):
   - BUT if sessionId wasn't stored properly...
   - Backend creates ANOTHER new sessionId
   - NEW empty cart is queried/created
   - Response shows 0 items

## Test Command:

Run this to see actual database state and API responses with detailed logging.
