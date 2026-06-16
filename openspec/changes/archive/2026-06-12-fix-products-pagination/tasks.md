## 1. Fix pagination in products handler

- [x] 1.1 Replace `skip: 0` with computed `skip` variable in `router.get('/')` at `backend/src/routes/products.ts:47`
- [x] 1.2 Add input validation: clamp `pageNum` to minimum 1 with `Math.max(1, parseInt(page as string) || 1)`
- [x] 1.3 Add input validation: clamp `limitNum` to range 1–100 with `Math.min(100, Math.max(1, parseInt(limit as string) || 10))`
- [x] 1.4 Remove or update misleading FIXME comment on line 13, update comment on line 47
- [x] 1.5 Verify `page=1` still returns products 1–10 (no regression)
- [x] 1.6 Verify `page=2` now returns products 11–20 instead of duplicating page 1
