# Decimal Type Serialization Fix

## Problem
When admin forms submitted product data with numeric fields (baseCost, basePrice, discountPercent), Zod validation was failing with:
```
400 Bad Request: baseCost, basePrice, discountPercent: Expected a number, but received a string
```

## Root Cause
Prisma stores monetary values as `Decimal` type. When JSON serializes these objects, Decimal fields are converted to strings (e.g., "1500.00" instead of 1500). The admin form's Zod validation expects numeric types.

## Solution
Created a helper function to convert Decimal fields to native JavaScript numbers in all product-related API responses.

### Helper Function
```typescript
const convertProductToJSON = (product: any) => ({
  ...product,
  baseCost: Number(product.baseCost),
  basePrice: Number(product.basePrice),
  discountPercent: Number(product.discountPercent),
  variants: product.variants?.map((v: any) => ({
    ...v,
    cost: v.cost ? Number(v.cost) : null,
    price: v.price ? Number(v.price) : null,
  })),
});
```

## Files Modified

### src/interface/controllers/AdminProductController.ts
Applied Decimal→Number conversion to:

1. **createProduct** - Product response
   - Wrapped sendSuccess with `convertProductToJSON(product)`
   
2. **updateProduct** - Product response
   - Wrapped sendSuccess with `convertProductToJSON(product)`
   
3. **getProductById** - Product response (already had manual conversion)
   - Refactored to use helper function
   
4. **createVariant** - Variant response
   - Added `cost: Number(...)` and `price: Number(...)`
   
5. **updateVariant** - Variant response
   - Added `cost: Number(...)` and `price: Number(...)`
   
6. **getProductVariants** - Variants list response
   - Map each variant: `cost: Number(...)`, `price: Number(...)`
   
7. **generateVariants** - Generated variants response
   - Map each created variant with Decimal conversion

### src/application/services/ProductService.ts
Fixed TypeScript error in variant attributes mapping:
- Changed `colorHex?: string` to `colorHex?: string | null`
- Added fallback: `colorHex: v.colorHex || undefined`

## Endpoints Fixed
- `POST /admin/products` - Create product
- `PATCH /admin/products/:id` - Update product
- `GET /admin/products/:id` - Get product details
- `POST /admin/products/:productId/variants` - Create variant
- `PATCH /admin/variants/:variantId` - Update variant
- `GET /admin/products/:productId/variants` - List variants
- `POST /admin/products/:productId/generate-variants` - Generate variants

## Testing Checklist
- [ ] Create new product with numeric prices
- [ ] Update product prices
- [ ] Create product variant with cost/price
- [ ] Update variant cost/price
- [ ] Generate variant combinations
- [ ] Form pre-population with correct numeric types
- [ ] No 400 Bad Request errors on form submission

## Type Safety
All Decimal conversions use `Number()` coercion which:
- Converts string representations: "1500.00" → 1500
- Preserves nulls: null → null (with null check)
- Handles decimals correctly: 1500.50 → 1500.5

The helper function ensures consistency across all product endpoints and prevents similar issues in the future.
