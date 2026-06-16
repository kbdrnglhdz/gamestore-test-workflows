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
- **THEN** an error message "Invalid credentials" is displayed
- **AND** no tokens are issued

### Requirement: Session Persistence
Users SHALL maintain their session for 15 minutes after login.

#### Scenario: Session timeout
- **WHEN** 15 minutes pass without any request from an authenticated user
- **THEN** the session expires
- **AND** the user must log in again

**KNOWN BUG:** Session expires after 15 minutes regardless of user activity.
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
- **THEN** the session is terminated
- **AND** tokens are invalidated

#### Scenario: Post-logout access
- **WHEN** a logged-out user attempts to access a protected resource
- **THEN** the system returns a 401 Unauthorized error