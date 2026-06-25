## MODIFIED Requirements

### Requirement: Proactive access token refresh
The client SHALL refresh the access token before it expires, avoiding mid-request 401 errors.

#### Scenario: Refresh before expiry threshold
- **WHEN** an access token reaches 80% of its lifetime (24 minutes for 30min tokens)
- **THEN** the client SHALL automatically call `/auth/refresh` to obtain a new token
- **AND** the new access token SHALL be used for subsequent requests
