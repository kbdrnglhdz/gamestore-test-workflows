## Why

The 15-minute session timeout is too short for real-world use. Extending to 30 minutes balances improved user experience with reasonable security, avoiding the 60-minute window which was considered too long.

## What Changes

- Increase session expiration from 15 minutes to 30 minutes in the auth module
- Update the refresh token threshold from 12 minutes (80% of 15min) to 24 minutes (80% of 30min)
- Remove the "session expires regardless of activity" stale bug reference

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `auth`: Change Session Persistence requirement from 15 minutes to 30 minutes
- `session-timeout`: Update proactive refresh threshold from 12 min to 24 min (80% of 30 min)

## Impact

- **Backend**: JWT token expiry in auth middleware (`'15m'` → `'30m'`)
- **Frontend**: No code changes needed (timing is computed from JWT claims dynamically)
- **Specs**: auth/spec.md and session-timeout/spec.md need delta updates
