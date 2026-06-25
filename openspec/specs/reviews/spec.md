# reviews Specification

## Purpose
TBD - created by archiving change test-ci-1. Update Purpose after archive.
## Requirements
### Requirement: Create Review
Authenticated users SHALL be able to create a review for a product with a rating (1-5) and a comment.

#### Scenario: Create review successfully
- **WHEN** an authenticated user sends a POST request to `/api/products/:id/reviews` with `rating: 4` and `comment: "Great game!"`
- **THEN** the system returns status 201 with the created review object

#### Scenario: Create review without authentication
- **WHEN** an unauthenticated user sends a POST request to `/api/products/:id/reviews`
- **THEN** the system returns status 401 with error message

#### Scenario: Create review with invalid rating
- **WHEN** an authenticated user sends a POST request with `rating: 6`
- **THEN** the system returns status 400 with validation error

#### Scenario: Create review with empty comment
- **WHEN** an authenticated user sends a POST request with `comment: ""`
- **THEN** the system returns status 400 with validation error

#### Scenario: Duplicate review
- **WHEN** an authenticated user sends a second POST request for the same product
- **THEN** the system returns status 409 with duplicate review error

#### Scenario: Review for non-existent product
- **WHEN** an authenticated user sends a POST request to `/api/products/999/reviews`
- **THEN** the system returns status 404

### Requirement: List Reviews
Users SHALL be able to view all reviews for a product without authentication.

#### Scenario: List reviews for a product
- **WHEN** a user sends a GET request to `/api/products/:id/reviews`
- **THEN** the system returns status 200 with an array of reviews

#### Scenario: List reviews for product with no reviews
- **WHEN** a user sends a GET request to `/api/products/:id/reviews` for a product with no reviews
- **THEN** the system returns status 200 with an empty array

#### Scenario: List reviews for non-existent product
- **WHEN** a user sends a GET request to `/api/products/999/reviews`
- **THEN** the system returns status 404

