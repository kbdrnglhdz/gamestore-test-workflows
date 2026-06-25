# Delta for Catalog

## ADDED Requirements

### Requirement: [NOMBRE_FUNCIONALIDAD]
<!-- Ejemplo: Product Search, Filter by Category -->

#### Scenario: Successful operation
- GIVEN products exist in database
- WHEN user requests [funcionalidad]
- THEN results are returned with pagination ([PAGE_SIZE] items per page)
- AND each item includes id, name, price, stock

#### Scenario: Empty results
- GIVEN no products match the criteria
- WHEN user requests [funcionalidad]
- THEN an empty array is returned
- AND status code 200 (not 404)

## Performance Requirements (always include)
- Response time MUST be < 500ms for 100 products
- N+1 queries MUST be avoided (use Prisma `include`)
- Images MUST be lazy-loaded
- Cache TTL: 5 minutes for product lists
- Use `parseInt(page, 10)` to avoid NaN in pagination