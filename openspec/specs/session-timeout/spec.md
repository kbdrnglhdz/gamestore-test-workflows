# Session Timeout Specification

## Purpose
Proactive session management to prevent mid-session token expiry and provide graceful user experience.

## Requirements

### Requirement: Rotate refresh token on refresh
The system SHALL generate and persist a new refresh token each time `/auth/refresh` is called, invalidating the previous one.

#### Scenario: Successful refresh with rotation
- **WHEN** a client sends a valid refresh token to `POST /auth/refresh`
- **THEN** the server returns a new access token AND a new refresh token
- **AND** the old refresh token is no longer valid for future refresh calls

#### Scenario: Reuse of old refresh token after rotation
- **WHEN** a client sends a previously valid refresh token that has been rotated
- **THEN** the server SHALL return `401 Invalid refresh token`

### Requirement: Proactive access token refresh
The client SHALL refresh the access token before it expires, avoiding mid-request 401 errors.

#### Scenario: Refresh before expiry threshold
- **WHEN** an access token reaches 80% of its lifetime (12 minutes for 15min tokens)
- **THEN** the client SHALL automatically call `/auth/refresh` to obtain a new token
- **AND** the new access token SHALL be used for subsequent requests

### Requirement: Deduplicate concurrent refresh calls
The client SHALL ensure only one refresh request is in-flight at a time, even if multiple API calls trigger refresh simultaneously.

#### Scenario: Multiple 401s trigger single refresh
- **WHEN** multiple API requests receive 401 responses simultaneously
- **THEN** only one `POST /auth/refresh` call SHALL be made
- **AND** all pending requests SHALL retry with the new token once the refresh completes

### Requirement: Graceful session timeout notification
The client SHALL notify the user before the session expires and provide a way to extend it.

#### Scenario: Session expiry warning
- **WHEN** the access token is within 1 minute of expiry
- **THEN** the client SHALL display a notification: "Your session is about to expire"
- **AND** the notification SHALL include an "Extend Session" button

#### Scenario: Extend session from notification
- **WHEN** the user clicks "Extend Session" on the expiry notification
- **THEN** the client SHALL call `/auth/refresh` to get new tokens
- **AND** the notification SHALL dismiss

#### Scenario: Session expired with no action
- **WHEN** the access token expires and the user did not extend the session
- **THEN** the client SHALL redirect to the login page
- **AND** SHALL clear stored tokens

### Requirement: JWT secret via environment variable
The server SHALL read the JWT signing secret from an environment variable instead of using a hardcoded value.

#### Scenario: Environment variable set
- **WHEN** `JWT_SECRET` environment variable is set
- **THEN** the server SHALL use its value for JWT signing and verification

#### Scenario: Fallback to hardcoded secret
- **WHEN** `JWT_SECRET` environment variable is NOT set
- **THEN** the server SHALL use the existing hardcoded secret as fallback
- **AND** SHALL log a warning about missing environment variable
