## ADDED Requirements

*(none — no new requirements added)*

## MODIFIED Requirements

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
