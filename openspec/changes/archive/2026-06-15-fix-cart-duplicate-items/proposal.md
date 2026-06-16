## Why

The cart's `POST /cart/add` endpoint has two bugs that violate the existing Cart Specification: (1) adding a product already in the cart creates a duplicate `CartItem` row instead of incrementing the existing item's quantity, and (2) no stock validation is performed before adding items. These cause incorrect cart state and allow overselling.

## What Changes

- **Fix duplicate items**: When a product already exists in the cart, update its `quantity` (existing + requested) instead of creating a new `CartItem` row
- **Add stock validation**: Before adding to cart, validate that the product has sufficient stock for the requested quantity (considering existing quantity if item is already in cart)
- Return `400` with `"Insufficient stock"` error when stock is insufficient

## Capabilities

### New Capabilities
_None — this is a bug fix that makes implementation match existing spec requirements._

### Modified Capabilities
- `cart`: Remove `KNOWN BUG` annotations from "Add Item to Cart" requirement once implementation matches spec (duplicate items fix and stock validation)

## Impact

- `backend/src/routes/cart.ts` — single-file change to `POST /cart/add` handler
- No API contract changes (response shape, status codes unchanged)
- No database schema changes
- No frontend changes needed
