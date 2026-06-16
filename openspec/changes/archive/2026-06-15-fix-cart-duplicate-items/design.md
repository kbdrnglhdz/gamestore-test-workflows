## Context

The `POST /cart/add` handler in `backend/src/routes/cart.ts` detects existing items via `prisma.cartItem.findFirst()` but then creates a **new** row with `prisma.cartItem.create()` instead of updating the existing one. Additionally, no stock check is performed before inserting. The constraints are: single-file change, no schema migration, no API contract change.

## Goals / Non-Goals

**Goals:**
- Increment quantity on existing cart item instead of duplicating
- Validate product stock before adding to cart
- Return clear error on insufficient stock
- Maintain existing test users and seed data compatibility

**Non-Goals:**
- Cart total recalculation (separate bug)
- Cart persistence across reloads (separate bug)
- Cart clearing after checkout (separate bug)
- Frontend form validation improvements

## Decisions

1. **`prisma.cartItem.update()` over `create()` when item exists**
   - Why: Minimal change — the `findFirst` already gives us `existingItem.id`. Using `update({ where: { id } })` with `quantity: existingItem.quantity + quantity` is the simplest fix that matches the spec's "increment" behavior.
   - Alternative considered: `upsert` was rejected because the semantics differ (upsert with `cartId + productId` as compound key would require schema change).

2. **Stock validation before the if/else branch, not inside**
   - Why: Both paths (new item and existing item) need the check. Placing it once before the branch avoids duplication and makes the logic linear: validate → mutate → respond.
   - Stock check formula: `product.stock < (existingItem ? existingItem.quantity + quantity : quantity)` — correctly accounts for future total.

3. **`400` status for stock errors**
   - Why: Consistent with existing error pattern in the codebase (`res.status(400).json({ error: ... })` matches validation error style in other routes).

## Risks / Trade-offs

- **[Race condition]** Two concurrent requests from the same user for the same product could both pass stock validation before either completes → risk of overselling. Mitigation: Acceptable for current scope; add DB-level transaction with row lock if it becomes an issue later.
- **[Stale `existingItem`]** If quantity was modified between `findFirst` and `update`, the increment could be wrong. Mitigation: Use `update({ where: { id, quantity: existingItem.quantity }, data: { quantity: existingItem.quantity + quantity } })` with optimistic concurrency — Prisma returns `P2025` if no row matched, requiring a retry.
