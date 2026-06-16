## Context

GameStore runs on Express/TypeScript + Prisma (SQLite) backend and React/Vite/Tailwind frontend. The `Product` model currently stores `price` as `String`, causing alphabetical sorting. There is no admin role guard — any authenticated user can write to products. The POST/PUT/DELETE routes lack input validation. The Admin panel has no product management UI.

## Goals / Non-Goals

**Goals:**
- Enable admin users to create products via a form in the Admin panel
- Fix price storage from `String` to `Float` via Prisma migration
- Add `requireAdmin` middleware to protect write routes (POST, PUT, DELETE)
- Add full server-side validation for product creation
- Add client-side validation in the admin form
- Fix pagination bug (`skip: 0` hardcoded → use computed `skip`)
- Update seed data to use `Float` prices

**Non-Goals:**
- Product editing/updating UI (PUT route exists but no dedicated form — reuse create form pattern)
- Product deletion UI (DELETE route exists but out of scope)
- Image upload (accept external URLs only)
- Bulk product import/export
- Product categories CRUD (use existing hardcoded list)

## Decisions

| Decision | Choice | Rationale | Alternatives |
|----------|--------|-----------|-------------|
| Price type | `Float` in Prisma | SQLite supports Float; aligns with numeric operations (sort, filter, math) | `Decimal` (overkill for game prices), `Int` cents (adds conversion complexity) |
| Admin guard | Middleware function `requireAdmin` | Reusable across routes; follows existing `authenticate` pattern | Inline checks (duplicated, error-prone) |
| Validation library | Manual validation in route handler | Zero new dependencies; the validation is simple (type checks, range checks, URL regex) | `zod` (adds dep), `express-validator` (adds dep) |
| Image URL validation | Regex check for http/https | Simple, no false positives; blocks relative paths and protocols | URL parsing lib, actual fetch check (slow, unreliable) |
| Category validation | Hardcoded array in products.ts | Matches existing frontend list; small fixed set | DB table (over-engineered for 12 categories) |
| Form UI | Inline expandable form in Admin.tsx | Simple, no modal library needed; follows React patterns | Modal (extra state), separate page (too much navigation) |

## Risks / Trade-offs

- **[Risk]** Price migration from `String` to `Float` could fail if existing data has non-numeric prices → **Mitigation**: Seed data is controlled (always numeric). Add try/catch in migration with default 0 fallback.
- **[Risk]** SQLite lacks `CHECK` constraints → **Mitigation**: Validate at application layer in the route handler.
- **[Risk]** Frontend form lacks a UI library for error display → **Mitigation**: Use simple `<p className="text-red-500">` inline errors — Tailwind already available.
- **[Trade-off]** Hardcoded categories mean adding a new category requires a code change → Acceptable for current scope (12 game genres).
