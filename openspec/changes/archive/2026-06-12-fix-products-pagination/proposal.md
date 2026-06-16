## Why

Product pagination is broken — page 2 returns the same products as page 1 due to a hardcoded `skip: 0` in the Prisma query. Users cannot browse past the first 10 products, making the catalog unusable beyond the first page.

## What Changes

- Fix the `skip` value in `GET /api/products` to use the computed offset instead of hardcoded `0`
- Add input validation for `page` and `limit` query parameters to prevent crashes on invalid values (NaN, negatives, zero)
- Update the existing catalog spec to mark the pagination bug as resolved
- Clean up misleading FIXME comments

## Capabilities

### New Capabilities

*(none — this is a bug fix within an existing capability)*

### Modified Capabilities

- `catalog`: Fix pagination requirement — page 2+ now returns correct products instead of duplicating page 1

## Impact

- **Backend**: One handler (`backend/src/routes/products.ts` — `router.get('/')`)
- **Schema**: No changes (pagination fix is purely code-level)
- **Frontend**: No API contract changes — response shape stays identical, only `products` array content changes for page > 1
