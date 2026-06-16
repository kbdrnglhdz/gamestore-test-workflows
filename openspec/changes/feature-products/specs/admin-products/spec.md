## ADDED Requirements

### Requirement: Admin Product Creation
Admins SHALL create products via a form in the admin panel with full validation.

#### Scenario: Successful creation with all required fields
- **WHEN** an admin submits valid product data (name, description, price, image, stock, category)
- **THEN** the system creates the product with auto-generated id and createdAt, and returns 201

#### Scenario: Price must be a positive number
- **WHEN** an admin submits a price that is not a positive number (e.g., "gratis", -10)
- **THEN** the system returns 400 with error "price must be a positive number"

#### Scenario: Stock must be a non-negative integer
- **WHEN** an admin submits stock that is not a non-negative integer (e.g., 10.5, -1)
- **THEN** the system returns 400 with error "stock must be a non-negative integer"

#### Scenario: Name must be non-empty
- **WHEN** an admin submits an empty name or name longer than 200 characters
- **THEN** the system returns 400 with error "name is required (max 200 characters)"

#### Scenario: Description must be non-empty
- **WHEN** an admin submits an empty description or description longer than 2000 characters
- **THEN** the system returns 400 with error "description is required (max 2000 characters)"

#### Scenario: Image must be a valid HTTP/HTTPS URL
- **WHEN** an admin submits an image that is not a valid http/https URL
- **THEN** the system returns 400 with error "image must be a valid URL (http/https)"

#### Scenario: Category must be from the allowed list
- **WHEN** an admin submits a category not in the allowed list
- **THEN** the system returns 400 with error listing the allowed categories

### Requirement: Admin-Only Access Control
Only users with role "admin" SHALL create, update, or delete products.

#### Scenario: Non-admin user cannot create products
- **WHEN** a user with role "user" sends POST /api/products
- **THEN** the system returns 403 with error "Admin access required"

#### Scenario: Non-admin user cannot update products
- **WHEN** a user with role "user" sends PUT /api/products/:id
- **THEN** the system returns 403 with error "Admin access required"

#### Scenario: Non-admin user cannot delete products
- **WHEN** a user with role "user" sends DELETE /api/products/:id
- **THEN** the system returns 403 with error "Admin access required"

### Requirement: Admin Product List
Admins SHALL view all products in a table within the admin panel.

#### Scenario: Products table displays after creation
- **WHEN** an admin creates a new product
- **THEN** the product list table in the admin panel refreshes and shows the new product

#### Scenario: Products table columns
- **WHEN** an admin views the products table in the admin panel
- **THEN** the table shows columns: ID, Name, Price, Stock, Category
