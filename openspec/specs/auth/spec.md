# Auth Specification

## Purpose
Authentication and session management for GameStore.

## Requirements

### Requirement: User Login
Users SHALL authenticate with email and password to access the system.

#### Scenario: Valid credentials
- **WHEN** a user submits the login form with email "test@example.com" and password "secret"
- **THEN** a JWT access token is returned
- **AND** a refresh token is stored in HTTP-only cookie

#### Scenario: Invalid credentials
- **WHEN** a user submits the login form with invalid email or password
- **THEN** the system returns a 401 status
- **AND** the response body SHALL contain `{ "error": "Invalid credentials", "code": "INVALID_CREDENTIALS" }`

#### Scenario: Missing email field
- **WHEN** a user submits the login form without an email field
- **THEN** the system returns a 400 status
- **AND** the response body SHALL contain `{ "error": "Email is required", "code": "VALIDATION_ERROR" }`

#### Scenario: Missing password field
- **WHEN** a user submits the login form without a password field
- **THEN** the system returns a 400 status
- **AND** the response body SHALL contain `{ "error": "Password is required", "code": "VALIDATION_ERROR" }`

#### Scenario: Invalid email format
- **WHEN** a user submits the login form with a malformed email (e.g., "not-an-email")
- **THEN** the system returns a 400 status
- **AND** the response body SHALL contain `{ "error": "Invalid email format", "code": "VALIDATION_ERROR" }`

### Requirement: Session Persistence
Users SHALL maintain their session for 60 minutes after login.

#### Scenario: Session timeout
- **WHEN** 60 minutes pass without any request from an authenticated user
- **THEN** the session expires
- **AND** the user must log in again

**KNOWN BUG:** Refresh token never renews automatically.

### Requirement: Password Storage
Users SHALL have their passwords stored securely.

#### Scenario: Password hashing on registration
- **WHEN** a new user registers with a password
- **THEN** the password is stored as a hashed value

#### Scenario: Password verification on login
- **WHEN** a user provides the correct password during login
- **THEN** the system verifies the hash matches before granting access

**KNOWN BUG:** Passwords are stored in plain text in the database.
**VIOLATION:** This does NOT follow security best practices.

### Requirement: User Logout
Users SHALL end their session by logging out of the system.

#### Scenario: Successful logout
- **WHEN** an authenticated user clicks the logout button
- **AND** confirms the logout prompt
- **THEN** the session is terminated
- **AND** tokens are invalidated on the server
- **AND** the user is redirected to the login page

#### Scenario: Post-logout access
- **WHEN** a logged-out user attempts to access a protected resource
- **THEN** the system returns a 401 Unauthorized error

#### Scenario: Logout API failure
- **WHEN** the logout API call fails due to a network error
- **THEN** the user is still logged out locally (tokens cleared, state reset)
- **AND** the user is redirected to the login page

### Requirement: User Registration
Users SHALL create an account with email, password, and name.

#### Scenario: Successful registration
- **WHEN** a new user submits the register form with valid email, password, and name
- **THEN** a JWT access token is returned
- **AND** a refresh token is stored in HTTP-only cookie

#### Scenario: Duplicate email
- **WHEN** a user submits the register form with an email that already exists
- **THEN** the system returns a 400 status
- **AND** the response body SHALL contain `{ "error": "Email already exists", "code": "DUPLICATE_EMAIL" }`

#### Scenario: Missing name field
- **WHEN** a user submits the register form without a name field
- **THEN** the system returns a 400 status
- **AND** the response body SHALL contain `{ "error": "Name is required", "code": "VALIDATION_ERROR" }`

#### Scenario: Missing email field
- **WHEN** a user submits the register form without an email field
- **THEN** the system returns a 400 status
- **AND** the response body SHALL contain `{ "error": "Email is required", "code": "VALIDATION_ERROR" }`

#### Scenario: Missing password field
- **WHEN** a user submits the register form without a password field
- **THEN** the system returns a 400 status
- **AND** the response body SHALL contain `{ "error": "Password is required", "code": "VALIDATION_ERROR" }`

#### Scenario: Invalid email format
- **WHEN** a user submits the register form with a malformed email
- **THEN** the system returns a 400 status
- **AND** the response body SHALL contain `{ "error": "Invalid email format", "code": "VALIDATION_ERROR" }`

### Requirement: Token Refresh
Users SHALL obtain a new access token using a valid refresh token.

#### Scenario: Missing refresh token
- **WHEN** a user submits a refresh request without a refresh token
- **THEN** the system returns a 400 status
- **AND** the response body SHALL contain `{ "error": "Refresh token required", "code": "MISSING_REFRESH_TOKEN" }`

#### Scenario: Invalid refresh token
- **WHEN** a user submits a refresh request with an invalid or expired refresh token
- **THEN** the system returns a 401 status
- **AND** the response body SHALL contain `{ "error": "Invalid refresh token", "code": "INVALID_REFRESH_TOKEN" }`

### Requirement: Auth Middleware
Protected routes SHALL reject unauthenticated requests with appropriate error codes.

#### Scenario: No token provided
- **WHEN** a request to a protected route has no Authorization header
- **THEN** the system returns a 401 status
- **AND** the response body SHALL contain `{ "error": "No token provided", "code": "MISSING_TOKEN" }`

#### Scenario: Malformed token
- **WHEN** a request to a protected route has a malformed or invalid JWT
- **THEN** the system returns a 401 status
- **AND** the response body SHALL contain `{ "error": "Invalid token", "code": "INVALID_TOKEN" }`

#### Scenario: Expired token
- **WHEN** a request to a protected route has an expired JWT
- **THEN** the system returns a 401 status
- **AND** the response body SHALL contain `{ "error": "Token expired", "code": "TOKEN_EXPIRED" }`

### Requirement: User Profile
Authenticated users SHALL retrieve their profile information.

#### Scenario: User not found
- **WHEN** an authenticated user's account has been deleted but their token is still valid
- **THEN** the system returns a 404 status
- **AND** the response body SHALL contain `{ "error": "User not found", "code": "USER_NOT_FOUND" }`

### Requirement: Server Error Handling
All auth endpoints SHALL handle unexpected errors gracefully without leaking internal details.

#### Scenario: Internal server error
- **WHEN** an unexpected error occurs during any auth operation
- **THEN** the system returns a 500 status
- **AND** the response body SHALL contain `{ "error": "Internal server error", "code": "INTERNAL_ERROR" }`
- **AND** the response SHALL NOT expose internal error details (e.g., stack traces, Prisma error messages)