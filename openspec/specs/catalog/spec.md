# Catalog Specification

## Purpose
Product listing, filtering, and pagination for GameStore.

## Requirements

### Requirement: Product Pagination
Users SHALL browse products in pages of 10 items.

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
- **WHEN** a user requests page with a negative number
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
Users SHALL filter products by price range.

#### Scenario: Filter by price range
- **WHEN** a user applies a price filter between 10 and 30
- **THEN** products with prices 15 and 25 are shown

#### Scenario: Sort by price ascending
- **WHEN** a user selects "Price: Low to High"
- **THEN** products are ordered from lowest to highest price

#### Scenario: Sort by price descending
- **WHEN** a user selects "Price: High to Low"
- **THEN** products are ordered from highest to lowest price

**KNOWN BUG:** Price filter orders products alphabetically instead of numerically.

### Requirement: Product Images
Users SHALL view product images correctly.

#### Scenario: Display product image
- **WHEN** a user views a product in the catalog
- **THEN** the product image is displayed from the backend URL

#### Scenario: Broken image fallback
- **WHEN** a product image URL is not accessible
- **THEN** a fallback placeholder image is shown

**KNOWN BUG:** Product images use absolute local paths instead of relative or CDN URLs, causing broken images in production.