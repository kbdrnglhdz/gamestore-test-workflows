# Cart Specification

## Purpose
Gestionar el carrito de compras del usuario autenticado, permitiendo agregar, modificar y eliminar productos, y finalizar la compra.

## Requirements

### Requirement: View Cart
Users SHALL view their shopping cart with all items, quantities, and prices.

#### Scenario: Authenticated user with existing cart
- **WHEN** an authenticated user navigates to the cart page
- **THEN** all cart items are displayed with name, image, quantity, and subtotal

#### Scenario: Authenticated user with empty cart
- **WHEN** an authenticated user navigates to the cart page with no items
- **THEN** a message "Your cart is empty" is displayed
- **AND** a link to browse products is shown

#### Scenario: Unauthenticated user
- **WHEN** an unauthenticated user navigates to the cart page
- **THEN** a message "Please login to view your cart" is displayed
- **AND** a link to the login page is shown

**KNOWN BUG:** Cart is lost on page reload because it only exists in local React state.
**VIOLATION:** Cart data should persist across sessions via the backend API.

### Requirement: Add Item to Cart
Users SHALL add products to their cart specifying quantity.

#### Scenario: Add new product to cart
- **WHEN** an authenticated user adds a product with quantity 1 to their cart
- **THEN** the product is added as a new cart item with quantity 1

#### Scenario: Add product that already exists in cart
- **WHEN** an authenticated user adds a product that already exists in their cart
- **THEN** the quantity of the existing item is incremented by the specified amount
- **AND** no duplicate cart item is created

#### Scenario: Add product exceeding available stock
- **WHEN** an authenticated user adds a product with quantity greater than available stock
- **THEN** an error message "Insufficient stock" is displayed
- **AND** the product is not added to the cart


### Requirement: Update Item Quantity
Users SHALL modify the quantity oopenspec show auth --type specf an existing cart item.

#### Scenario: Increment item quantity
- **WHEN** an authenticated user clicks "+" on a cart item
- **THEN** the item quantity increases by 1
- **AND** the subtotal is recalculated

#### Scenario: Decrement item quantity
- **WHEN** an authenticated user clicks "-" on a cart item with quantity greater than 1
- **THEN** the item quantity decreases by 1
- **AND** the subtotal is recalculated

#### Scenario: Update quantity exceeding stock
- **WHEN** an authenticated user updates item quantity to a value greater than available stock
- **THEN** an error message is displayed
- **AND** the previous quantity is preserved

**KNOWN BUG:** Cart total is not recalculated when item quantity changes via PUT endpoint (`backend/src/routes/cart.ts:99-100`).

### Requirement: Remove Item from Cart
Users SHALL remove individual items from their cart.

#### Scenario: Remove existing item
- **WHEN** an authenticated user clicks "Remove" on a cart item
- **THEN** the item is removed from the cart
- **AND** the cart total is updated

#### Scenario: Remove last item in cart
- **WHEN** an authenticated user removes the only item in their cart
- **THEN** the cart becomes empty
- **AND** the message "Your cart is empty" is displayed

### Requirement: Clear Cart
Users SHALL clear all items from their cart at once.

#### Scenario: Clear cart with multiple items
- **WHEN** an authenticated user clicks "Clear Cart"
- **THEN** all items are removed from the cart
- **AND** the message "Your cart is empty" is displayed

#### Scenario: Clear already empty cart
- **WHEN** an authenticated user clicks "Clear Cart" on an already empty cart
- **THEN** no action is taken
- **AND** the empty cart state is preserved

### Requirement: Cart Total Calculation
Users SHALL see an accurate, up-to-date total for their cart.

#### Scenario: Total updates when item is added
- **WHEN** an authenticated user adds a product to their cart
- **THEN** the cart total reflects the new item's subtotal

#### Scenario: Total updates when quantity changes
- **WHEN** an authenticated user changes the quantity of a cart item
- **THEN** the cart total is recalculated automatically

#### Scenario: Total updates when item is removed
- **WHEN** an authenticated user removes an item from their cart
- **THEN** the cart total is recalculated excluding the removed item

**KNOWN BUG:** The `total` state variable in `CartContext` is declared but never populated from the API response, so it is always 0 (`frontend/src/context/CartContext.tsx:37`).
**KNOWN BUG:** `Cart.tsx` captures `localTotal` via `useState(total)` on first render, creating a stale closure that never updates (`frontend/src/pages/Cart.tsx:8`).

### Requirement: Checkout
Users SHALL convert their cart items into an order, with stock validation and inventory decrement.

#### Scenario: Successful checkout with valid data
- **WHEN** an authenticated user completes the checkout form with a valid shipping address and payment method
- **AND** all cart items have sufficient stock
- **THEN** an order with status "pending" is created
- **AND** product stock is decremented by the ordered quantity
- **AND** the cart is cleared
- **AND** a confirmation message is displayed

#### Scenario: Checkout with empty cart
- **WHEN** an authenticated user attempts checkout with no items in the cart
- **THEN** an error message "Cart is empty" is displayed
- **AND** no order is created

#### Scenario: Checkout with missing shipping address
- **WHEN** an authenticated user attempts checkout without entering a shipping address
- **THEN** a validation error is displayed on the shipping address field

#### Scenario: Checkout with insufficient stock
- **WHEN** an authenticated user attempts checkout with items exceeding available stock
- **THEN** an error message is displayed identifying the product name, available stock, and requested quantity
- **AND** no order is created
- **AND** product stock is not decremented
- **AND** the cart is not cleared

#### Scenario: Concurrent checkout depleting stock
- **WHEN** two authenticated users attempt checkout for the same product simultaneously
- **AND** the combined requested quantity exceeds available stock
- **THEN** the first user's order is created successfully
- **AND** the second user receives an error identifying insufficient stock

**KNOWN BUG:** Order is created immediately with no confirmation step (`backend/src/routes/orders.ts:62-63`).
**KNOWN BUG:** No form validation on shipping address field (`frontend/src/pages/Checkout.tsx:11,77`).
**KNOWN BUG:** Error/success messages use `alert()` instead of proper UI components (`frontend/src/pages/Checkout.tsx:43`).
