## Why

The current 15-minute session timeout is too short for real-world usage, causing users to be logged out mid-task. Extending to 60 minutes provides a better user experience while maintaining reasonable security.

## What Changes

- Increase session expiration from 15 minutes to 60 minutes in the auth module
- Update the refresh token threshold from 12 minutes (80% of 15min) to 48 minutes (80% of 60min)
- Remove the "session expires regardless of activity" bug (session should be active for 60 min)
- All token expiry validation logic must reflect the new 60-minute window

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `auth`: Change Session Persistence requirement from 15 minutes to 60 minutes
- `session-timeout`: Update proactive refresh threshold from 12 min to 48 min (80% of 60 min)

## Impact

- **Backend**: JWT token expiry in auth middleware and login/refresh routes
- **Frontend**: Token refresh interval in API service layer
- **Specs**: auth/spec.md and session-timeout/spec.md need delta updates
