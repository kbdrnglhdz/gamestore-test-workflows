## Why

Product prices are stored as strings in the database, causing price filtering and sorting to use alphabetical instead of numerical comparison. This means "10" < "2" and price ranges produce incorrect results.

## What Changes

- Change `Product.price` column type from `String` to `Float` in Prisma schema
- Remove `String(price)` coercion in product create/update routes
- Update frontend `Product` interface to use `number` instead of `string`
- Migrate existing string price data to floats

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `catalog`: Price filter requirement — change from string-based to numeric comparison. Sort by price now uses numerical ordering.

## Impact

- **Prisma schema**: `Product.price` type changes
- **Backend routes**: `POST /api/products`, `PUT /api/products/:id` — remove `String()` coercion
- **Frontend**: `Products.tsx` — `price` field type from `string` to `number`
- **Database**: Existing data needs migration (e.g., `parseFloat` conversion)
