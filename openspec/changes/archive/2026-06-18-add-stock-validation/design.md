## Context

The checkout endpoint (`POST /api/orders`) creates an order without validating product stock levels. This allows customers to order more of a product than is available, resulting in unfulfillable orders. Additionally, after creating an order, the product stock is not decremented, and the cart is not cleared server-side.

## Goals / Non-Goals

**Goals:**
- Validate sufficient stock for each cart item before order creation, returning a clear error identifying the problematic item
- Decrement product stock atomically when an order is created
- Clear the cart server-side within the same transaction as order creation
- Surface backend validation errors to users on the checkout page

**Non-Goals:**
- No schema or model changes (stock field already exists on Product model)
- No migration required
- No changes to the add-to-cart flow (stock check at add-time is already spec'd)
- No UI redesign — error display improvements are minimal

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Validation scope | Validate stock BEFORE the transaction | Fail fast with a clear error before entering the expensive transaction |
| Atomicity | `prisma.$transaction` wrapping order creation + stock decrement + cart cleanup | Ensures all-or-nothing semantics; if stock decrement fails, the order is rolled back |
| Error format | Return 400 with `{ error: string }` identifying the product name | Consistent with existing API error format (see cart.ts, auth.ts) |
| Stock field type | Keep existing `Int` field on Product model | Already present in schema; no migration needed |

## Risks / Trade-offs

- **Race condition**: Concurrent checkout requests could both pass validation then oversell stock. → Mitigated by the transaction: `prisma.$transaction` uses serializable isolation for Prisma SQLite (default), so the second write will fail and roll back. Acceptable for this app's scale.
- **Error message clarity**: Showing raw backend error via `alert()`. → Trade-off: acceptable for this iteration; proper toast/notification UI is a separate concern.
