---
type: "query"
date: "2026-06-15T20:39:12.327131+00:00"
question: "Los items duplicados se suman en lugar de incrementar cantidad"
contributor: "graphify"
source_nodes: ["Cart Duplicate Items Bug", "router", "cart.ts"]
---

# Q: Los items duplicados se suman en lugar de incrementar cantidad

## Answer

Duplicate cart items bug at backend/src/routes/cart.ts:52-60. When adding a product already in the cart, the code creates a new CartItem row instead of updating the existing one's quantity. The if-branch that detects an existingItem calls cartItem.create() with the requested quantity, not existingItem.quantity + quantity. This means adding the same product twice gives you two separate cart line items instead of one line with quantity=2.

## Source Nodes

- Cart Duplicate Items Bug
- router
- cart.ts