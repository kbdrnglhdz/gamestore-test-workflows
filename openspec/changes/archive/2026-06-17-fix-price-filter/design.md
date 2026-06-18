## Context

The `Product.price` field is stored as `String` in the Prisma schema backed by SQLite. This causes all price filtering (`gte`/`lte`) and sorting (`price_asc`/`price_desc`) to use lexicographic ordering — e.g., "10" < "2" and "100" < "9". The bug is documented in both the source code (`FIXME` comments in `products.ts`) and the existing catalog spec.

## Goals / Non-Goals

**Goals:**
- Change `Product.price` type from `String` to `Float` in Prisma schema
- Fix price filtering (`minPrice`, `maxPrice`) to use numerical comparison
- Fix price sorting to use numerical ordering
- Migrate existing string price data to floats

**Non-Goals:**
- Changing the `CartItem` or `OrderItem` price models (those use different types)
- Adding input validation or sanitization beyond type changes
- Refactoring the frontend display formatting

## Decisions

1. **`Float` over `Decimal`**: SQLite does not have a native `Decimal` type; Prisma maps `Float` to SQLite `REAL`. Since all prices are in whole dollars or simple decimals (as shown in seed data), `Float` precision is sufficient and avoids the complexity of `Decimal` handling.

2. **In-place migration over seed reset**: Rather than dropping and re-seeding the database, a migration will alter the column type. Existing string values like `"29.99"` will be cast via a raw SQL `UPDATE` using `CAST(price AS REAL)` within the migration. This preserves existing data.

3. **Drop `String()` coercion in routes**: The `POST` and `PUT` handlers in `products.ts` explicitly wrap `price` with `String()`. Removing this is a one-line change per handler. Prisma's type safety will enforce the new schema.

## Risks / Trade-offs

- **[Risk]** `CAST(price AS REAL)` may fail on non-numeric string values (e.g., `"free"`) → **[Mitigation]** Validate seed data is numeric; add a fallback default of `0` for unparseable values.
- **[Risk]** SQLite `ALTER TABLE` does not support changing column types — a manual migration with table recreation may be needed → **[Mitigation]** Prisma's `migrate dev` handles this internally by recreating tables; confirm with `prisma:migrate` before merging.
- **[Trade-off]** `Float` may introduce minor floating-point precision edge cases for very long decimals. Acceptable for a workshop app; not acceptable for financial production systems.
