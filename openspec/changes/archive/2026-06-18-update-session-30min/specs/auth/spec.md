## MODIFIED Requirements

### Requirement: Session Persistence
Users SHALL maintain their session for 30 minutes after login.

#### Scenario: Session timeout
- **WHEN** 30 minutes pass without any request from an authenticated user
- **THEN** the session expires
- **AND** the user must log in again

## REMOVED Requirements

### Requirement: Session Persistence

**Reason**: The 15-minute session timeout was replaced with a 30-minute timeout (see MODIFIED above). The stale bug reference about 15-minute expiry regardless of activity is no longer applicable.
