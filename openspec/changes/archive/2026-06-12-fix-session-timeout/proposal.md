## Why

Users are unexpectedly logged out when their 15-minute access token expires mid-session. The refresh token is never rotated, creating both UX frustration (sudden logouts) and a security risk (stolen refresh tokens remain valid for 7 days).

## What Changes

- **Backend**: Rotate refresh tokens on every refresh call — issue a new refresh token and invalidate the old one
- **Backend**: Add a `/auth/me` endpoint (already exists) that returns user profile without leaking sensitive fields
- **Frontend**: Proactive token refresh — decode JWT on the client and refresh before expiry instead of waiting for a 401
- **Frontend**: Deduplicate concurrent refresh calls to prevent race conditions
- **Frontend**: Graceful session timeout UI — show a notification/toast before the session expires, allowing the user to extend their session
- **Security**: Move JWT secret to environment variable instead of hardcoded string

## Capabilities

### New Capabilities
- `session-timeout`: Graceful session timeout handling with proactive token refresh, refresh deduplication, and user notification before expiry

### Modified Capabilities
*(No existing specs are changing — this is a new feature area)*

## Impact

- **Backend**: `backend/src/routes/auth.ts` — refresh endpoint logic (rotate token), `/auth/me` cleanup
- **Backend**: `backend/src/middleware/auth.ts` — JWT secret via env var, token generation helpers
- **Backend**: `.env` file or environment config — add `JWT_SECRET` environment variable
- **Frontend**: `frontend/src/services/api.ts` — proactive refresh logic, deduplication, session timeout detection
- **Frontend**: `frontend/src/context/AuthContext.tsx` — track token expiry, provide session status to UI
- **Frontend**: New session-timeout UI components
