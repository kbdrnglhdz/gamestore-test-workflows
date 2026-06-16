## MODIFIED Requirements

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
