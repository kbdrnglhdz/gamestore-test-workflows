## 1. Backend — Stock Validation Before Order Creation

- [x] 1.1 Add stock validation loop in `backend/src/routes/orders.ts` after the empty-cart check and before total calculation — iterate cart items, query each product, return 400 with product name, available stock, and requested quantity if insufficient

## 2. Backend — Atomic Order Creation with Stock Decrement

- [x] 2.1 Wrap order creation, stock decrement, and cart cleanup in `prisma.$transaction` in `backend/src/routes/orders.ts`
- [x] 2.2 For each cart item, decrement `product.stock` by `item.quantity` within the transaction using `tx.product.update`
- [x] 2.3 Delete cart items server-side within the transaction after order creation

## 3. Frontend — Error Message Propagation

- [x] 3.1 Update `frontend/src/pages/Checkout.tsx` catch block to display the backend error message instead of a generic "Failed to place order" string

## 4. Backend — Unit Tests for Stock Validation

- [x] 4.1 Install vitest as dev dependency in backend/
- [x] 4.2 Create test for insufficient stock → returns 400 with product name, available stock, and requested quantity
- [x] 4.3 Create test for successful checkout → order created with status "pending", stock decremented, cart cleared
- [x] 4.4 Create test for empty cart → returns 400 "Cart is empty"
- [x] 4.5 Create test verifying stock is decremented and cart items deleted within the transaction

## 5. Frontend — Unit Tests for Checkout Error Handling

- [x] 5.1 Install vitest + @testing-library/react + @testing-library/jest-dom + jsdom in frontend/
- [x] 5.2 Create test: backend error (order.error) is displayed via alert()
- [x] 5.3 Create test: network error caught in catch block shows error?.message
- [x] 5.4 Create test: successful checkout calls clearCart and navigates to /products
