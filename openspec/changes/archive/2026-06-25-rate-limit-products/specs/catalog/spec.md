## MODIFIED Requirements

### Requirement: Product Pagination
Users SHALL browse products in pages of 10 items. All public catalog endpoints SHALL enforce rate limiting.

#### Scenario: First page
- **WHEN** a user requests page 1
- **THEN** products 1-10 are returned

#### Scenario: Second page
- **WHEN** a user requests page 2
- **THEN** products 11-20 are returned

#### Scenario: Last page (partial)
- **WHEN** a user requests the last page
- **THEN** the remaining products (less than 10) are returned

#### Scenario: Invalid page number
- **WHEN** a user requests page with a non-numeric value
- **THEN** page defaults to 1

#### Scenario: Negative page number
- **WHEN** a user requests a page with a negative number
- **THEN** page defaults to 1

#### Scenario: Page beyond available data
- **WHEN** a user requests a page beyond the last page
- **THEN** an empty product list is returned

#### Scenario: Limit exceeds maximum
- **WHEN** a user requests limit greater than 100
- **THEN** limit is capped at 100

#### Scenario: Invalid limit
- **WHEN** a user requests a non-numeric limit
- **THEN** limit defaults to 10

**KNOWN BUG — RESOLVED:** Page 2 previously returned the same products as page 1 due to `skip: 0` being hardcoded in the Prisma query. The fix replaces the hardcoded value with the computed offset variable.

### Requirement: Price Filter
Users SHALL filter and sort products by price range using numerical comparison.

#### Scenario: Filter by price range
- **WHEN** a user applies a price filter between 10 and 30
- **THEN** products with prices 15 and 25 are shown (numerical comparison, not alphabetical)

#### Scenario: Sort by price ascending
- **WHEN** a user selects "Price: Low to High"
- **THEN** products are ordered from lowest to highest price numerically

#### Scenario: Sort by price descending
- **WHEN** a user selects "Price: High to Low"
- **THEN** products are ordered from highest to lowest price numerically

**KNOWN BUG — RESOLVED:** Price no longer stored as `String`; changed to `Float` in Prisma schema with CAST migration. Filtering and sorting now use numerical comparison.

### Requirement: Product Images
Users SHALL view product images correctly.

#### Scenario: Display product image
- **WHEN** a user views a product in the catalog
- **THEN** the product image is displayed from the backend URL

#### Scenario: Broken image fallback
- **WHEN** a product image URL is not accessible
- **THEN** a fallback placeholder image is shown

**KNOWN BUG:** Product images use absolute local paths instead of relative or CDN URLs, causing broken images in production.

### Requirement: Product Recommendations
The system SHALL provide related products for any given product, using order analytics and category fallback.

#### Scenario: Related products displayed in product detail
- GIVEN a user views a product detail page
- WHEN the product has related items (same category or bought together)
- THEN the related products are displayed below the product details
- AND each item shows name, price, image, and category

#### Scenario: No related products
- GIVEN a user views a product with no related items
- WHEN the product is the only one in its category
- THEN an empty related products section is shown (or hidden)

## ADDED Requirements

### Requirement: Rate Limiting
Public product listing and detail endpoints SHALL enforce a rate limit of 30 requests per minute per IP. Protected product write endpoints SHALL enforce a rate limit of 15 requests per minute per IP.

#### Scenario: Public GET requests within limit
- **WHEN** a client sends fewer than 30 GET requests to `/api/products` within 1 minute
- **THEN** all requests succeed with status 200

#### Scenario: Public GET requests exceeding limit
- **WHEN** a client sends 31 GET requests to `/api/products` within 1 minute
- **THEN** the 31st request returns status 429
- **AND** the response body SHALL contain `{ "error": "Too many requests", "code": "RATE_LIMIT_EXCEEDED" }`
- **AND** the response SHALL include header `Retry-After`
- **AND** the response SHALL include header `X-RateLimit-Remaining: 0`

#### Scenario: Write endpoint within limit
- **WHEN** an authenticated user sends fewer than 15 POST/PUT/DELETE requests to `/api/products` within 1 minute
- **THEN** all requests succeed

#### Scenario: Write endpoint exceeding limit
- **WHEN** an authenticated user sends 16 POST/PUT/DELETE requests to `/api/products` within 1 minute
- **THEN** the 16th request returns status 429

#### Scenario: Rate limit resets after window
- **WHEN** a client exceeded the rate limit
- **AND** waits for the rate limit window to expire
- **THEN** subsequent requests succeed with status 200

## Performance Requirements

- Rate limit checking SHALL add no more than 5ms overhead per request
- Store in memory es aceptable para el alcance actual; SHOULD migrar a Redis si la aplicación escala a múltiples instancias
