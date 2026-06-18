## MODIFIED Requirements

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
