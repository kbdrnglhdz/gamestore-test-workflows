## MODIFIED Requirements

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
