## Context

The `GET /api/products` handler has a hardcoded `skip: 0` in its Prisma `findMany` call (line 47 of `backend/src/routes/products.ts`), making all pages return the first 10 products. The `skip` variable is correctly calculated but never used. Input validation for `page` and `limit` query parameters is also missing — NaN, negative, or zero values pass through to Prisma and cause crashes.

## Goals / Non-Goals

**Goals:**
- Fix pagination so each page returns the correct product slice
- Prevent crashes from invalid `page`/`limit` values
- Keep the fix scoped to the single handler with minimal code changes

**Non-Goals:**
- Fix the `price` as `String` issue (separate change)
- Add caching layer (separate change)
- Refactor type safety (`where: any`, `orderBy: any`)
- Fix the N+1 query pattern (separate change)

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| How to use `skip` | Replace `skip: 0` with `skip` | One-character change; variable already exists and is correctly computed |
| Input validation | `Math.max(1, parseInt(...) \|\| 1)` for page, `Math.min(100, Math.max(1, parseInt(...) \|\| 10))` for limit | Guards against NaN (via `\|\|` fallback), negatives/zero (via `Math.max`), and runaway limit values (via `Math.min` cap at 100) |
| FIXME comments | Remove the misleading comment on line 13; update the comment on line 47 | The original FIXME ("Offset calculation is wrong") points at the wrong line; after the fix it's noise |
| Existing catalog spec | Create a delta spec marking pagination as resolved and adding edge-case scenarios | Follows the spec-driven schema convention |

## Risks / Trade-offs

- **[Low risk]** The existing `skip: 0` acts as a default — after the fix, `page=1` still produces `skip=0`, so no regression for the common case
- **[Edge case]** `page=9999` returns an empty array — the frontend already handles `data.products || []` gracefully
- **[Scope creep]** The price string issue and N+1 query are adjacent — intentionally excluded to keep this change focused and low-risk
