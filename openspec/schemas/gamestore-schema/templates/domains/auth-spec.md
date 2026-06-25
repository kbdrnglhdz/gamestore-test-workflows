# Delta for Auth

## ADDED Requirements

### Requirement: [NOMBRE_FUNCIONALIDAD]
<!-- Ejemplo: Two-Factor Authentication, Password Reset -->

#### Scenario: Successful authentication flow
- GIVEN a user with valid credentials
- WHEN the user initiates [funcionalidad]
- THEN the system completes the action successfully
- AND a JWT token is issued (if login)
- AND a refresh token is stored in HTTP-only cookie

#### Scenario: Failed authentication
- GIVEN invalid or expired credentials
- WHEN the user attempts [funcionalidad]
- THEN an error message "[mensaje_error]" is displayed
- AND no token is issued

#### Scenario: Rate limiting (if login)
- GIVEN 5 failed attempts in 1 minute
- WHEN a 6th attempt is made
- THEN HTTP 429 (Too Many Requests) is returned

## Security Requirements (always include)
- Passwords MUST be hashed with bcrypt (cost factor 12)
- Tokens MUST expire after [tiempo] minutes
- Refresh tokens MUST be stored in HTTP-only cookies
- All auth endpoints MUST have rate limiting (5 attempts/minute)