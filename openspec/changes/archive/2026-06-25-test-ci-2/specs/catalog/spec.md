# Delta for Catalog

## ADDED Requirements

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

## Performance Requirements
- Response time MUST be < 500ms for 100 products
- N+1 queries MUST be avoided (use Prisma `include`)
- Images MUST be lazy-loaded
- Cache TTL: 5 minutes for product lists
