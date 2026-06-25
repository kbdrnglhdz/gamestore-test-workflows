## Why

Orders can be placed for products that are out of stock because no stock validation is performed during checkout. This allows customers to purchase unavailable items and leads to unfulfillable orders.

## What Changes

- Add stock validation before creating an order — reject checkout if any item exceeds available stock
- Decrement product stock atomically within a database transaction when the order is created
- Clear the cart server-side within the same transaction after the order is placed
- Propagate backend error messages to the user in the frontend checkout form

## Capabilities

### New Capabilities
*(none)*

### Modified Capabilities
- `cart`: Add stock validation and decrement to the checkout flow (Requirement: Checkout with insufficient stock, already specified but unimplemented)

## Impact

- `backend/src/routes/orders.ts` — Add stock validation loop before order creation; wrap order creation + stock decrement + cart cleanup in `prisma.$transaction`
- `frontend/src/pages/Checkout.tsx` — Improve error display to show backend validation messages
