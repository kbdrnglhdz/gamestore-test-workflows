## 1. Backend — Price migration (String → Float)

- [ ] 1.1 Change `price` type from `String` to `Float` in `backend/prisma/schema.prisma`
- [ ] 1.2 Update `backend/prisma/seed.ts` to use `Float` values for prices (e.g., `59.99` instead of `"59.99"`)
- [ ] 1.3 Run `npx prisma migrate dev --name change-price-to-float` to create migration
- [ ] 1.4 Run `npx prisma generate` to regenerate Prisma client
- [ ] 1.5 Re-seed database: `npx prisma db seed`

## 2. Backend — requireAdmin middleware

- [ ] 2.1 Add `requireAdmin` middleware function in `backend/src/middleware/auth.ts` that checks `req.userRole === 'admin'`
- [ ] 2.2 Export `requireAdmin` from auth.ts
- [ ] 2.3 Apply `requireAdmin` to POST, PUT, DELETE routes in `backend/src/routes/products.ts`
- [ ] 2.4 Apply `requireAdmin` to all routes in `backend/src/routes/admin.ts`

## 3. Backend — Input validation for POST /api/products

- [ ] 3.1 Add validation for `name` (required, 1-200 chars, non-empty after trim)
- [ ] 3.2 Add validation for `description` (required, 1-2000 chars, non-empty after trim)
- [ ] 3.3 Add validation for `price` (required, must be positive number, max 2 decimals)
- [ ] 3.4 Add validation for `image` (required, must match http/https URL pattern)
- [ ] 3.5 Add validation for `stock` (required, must be integer >= 0)
- [ ] 3.6 Add validation for `category` (required, must be in allowed list)
- [ ] 3.7 Return 400 with descriptive error message for each validation failure
- [ ] 3.8 Return 500 with generic message for unexpected server errors

## 4. Backend — Fix pagination and price filtering in GET /api/products

- [ ] 4.1 Fix `skip: 0` hardcoded bug — use `skip` variable instead: `skip: (pageNum - 1) * limitNum`
- [ ] 4.2 Update price filter to use numeric comparison (no longer string comparison)
- [ ] 4.3 Update price sort to order numerically (asc/desc)

## 5. Frontend — Admin product form and table

- [ ] 5.1 Add product list table section in Admin.tsx (columns: ID, Name, Price, Stock, Category)
- [ ] 5.2 Fetch products via `api.products.getAll()` on admin page load
- [ ] 5.3 Add "➕ New Product" button that shows/hides creation form
- [ ] 5.4 Build product creation form with fields: name (text), description (textarea), price (number step=0.01), image (text url), stock (number step=1), category (select)
- [ ] 5.5 Add client-side validation matching backend rules (required fields, types, ranges)
- [ ] 5.6 Show inline error messages (red text) below each invalid field
- [ ] 5.7 Call `api.products.create()` on form submit with loading state
- [ ] 5.8 Show success toast/alert on creation, reset form, refresh product table
- [ ] 5.9 Show error message from backend on failure (e.g., "price must be a positive number")
- [ ] 5.10 Add Cancel button to close/hide the form

## 6. Verification

- [ ] 6.1 Manual: Create 3 products with valid data — verify they appear in admin table and public catalog
- [ ] 6.2 Manual: Attempt creation with invalid price (text, negative) — verify 400 error
- [ ] 6.3 Manual: Attempt creation with user token (not admin) — verify 403 error
- [ ] 6.4 Manual: Verify `GET /api/products?sort=price_asc` returns numerically sorted results
- [ ] 6.5 Manual: Verify page 2 returns different products than page 1
