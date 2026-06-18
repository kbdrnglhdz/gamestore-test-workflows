## 0. Git Worktree Isolation

- [x] 0.1 Create `worktrees/` directory at repo root
- [x] 0.2 Create branch `fix/price-filter` from `main`
- [x] 0.3 Add git worktree at `worktrees/fix-price-filter` pointing to `fix/price-filter`
- [x] 0.4 Install dependencies and verify dev servers start from the worktree

## 1. Database Schema Migration

- [x] 1.1 Change `Product.price` type from `String` to `Float` in Prisma schema
- [x] 1.2 Create Prisma migration to apply schema change
- [x] 1.3 Add raw SQL step in migration to `CAST(price AS REAL)` existing data
- [x] 1.4 Update seed data to use numeric prices instead of strings

## 2. Backend Route Fixes

- [x] 2.1 Remove `String(price)` coercion in `POST /api/products` handler
- [x] 2.2 Remove `String(price)` coercion in `PUT /api/products/:id` handler
- [x] 2.3 Verify price filter (`minPrice`/`maxPrice`) uses numerical comparison with new `Float` type
- [x] 2.4 Verify price sort (`price_asc`/`price_desc`) uses numerical ordering

## 3. Frontend Updates

- [x] 3.1 Update `Product` interface in `Products.tsx` — change `price` from `string` to `number`
