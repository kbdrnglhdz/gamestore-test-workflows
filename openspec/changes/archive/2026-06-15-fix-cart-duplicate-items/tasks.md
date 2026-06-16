## 1. Stock validation

- [x] 1.1 Add `product` fetch before the if/else block using `prisma.product.findUnique`
- [x] 1.2 Add early return with `400` and `"Insufficient stock"` when stock is insufficient (considering existing quantity)

## 2. Fix duplicate item creation

- [x] 2.1 Replace `prisma.cartItem.create()` with `prisma.cartItem.update()` using `existingItem.id` and quantity `existingItem.quantity + quantity`

## 3. Optimistic concurrency

- [x] 3.1 Add condition `{ quantity: existingItem.quantity }` to the `where` clause to prevent stale updates
- [x] 3.2 Handle `P2025` error with a retry (refetch and reattempt)

## 4. Spec cleanup

- [x] 4.1 Remove `KNOWN BUG` annotations from `openspec/specs/cart/spec.md` for duplicate items and stock validation
