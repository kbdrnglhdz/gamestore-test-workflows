## Why

The GameStore lacks an admin interface for product management. Currently, products can only be added via direct database manipulation or the seed script. Admins need a proper UI and API to create products in the catalog, with validation, proper pricing (as Float not String), and access control.

## What Changes

- **Admin product creation form** in the Admin panel (`/admin`) with fields: name, description, price, image, stock, category
- **POST /api/products** endpoint with full server-side validation (types, ranges, URL format, allowed categories)
- **requireAdmin middleware** to restrict product write operations to admin role only
- **Price type migration** from `String` to `Float` in Prisma schema (fixes alphabetical sorting bug)
- **Pagination fix** in GET /api/products (use correct `skip` variable)
- **Seed update** to use `Float` for prices
- **Product list table** in Admin panel showing existing products with refresh after creation

## Capabilities

### New Capabilities
- `admin-products`: Admin CRUD for products — create products, validation, admin-only access control

### Modified Capabilities
- `catalog`: Price type changes from String to Float — filter/sort scenarios now work numerically. Product creation moves from manual DB to API.

## Impact

- **Backend**: `backend/prisma/schema.prisma` (price type), `backend/src/routes/products.ts` (validation + requireAdmin), `backend/src/middleware/auth.ts` (new requireAdmin), `backend/prisma/seed.ts` (Float prices)
- **Frontend**: `frontend/src/pages/Admin.tsx` (new product form + table), `frontend/src/services/api.ts` (types)
- **Database**: Requires a new Prisma migration to change price column type
