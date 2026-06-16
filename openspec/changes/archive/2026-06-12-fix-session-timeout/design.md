## Context

The app currently uses a JWT-based auth flow: access tokens (15min) + refresh tokens (7 days) stored in localStorage. On 401, the frontend calls `/auth/refresh` to get a new access token. The refresh token is never rotated (known bug). The JWT secret is hardcoded. There's no proactive refresh — users experience sudden logouts when the access token expires mid-action.

## Goals / Non-Goals

**Goals:**
- Rotate refresh tokens on every `/auth/refresh` call (new refresh token stored in DB)
- Proactively refresh the access token before it expires (avoid 401 UX)
- Deduplicate concurrent refresh requests to prevent race conditions
- Notify the user before session expiry and allow extending the session
- Move JWT secret to an environment variable

**Non-Goals:**
- Password hashing (separate change)
- Admin role enforcement (separate change)
- Cross-tab synchronization
- Server-side token revocation beyond refresh rotation
- "Remember me" / persistent sessions

## Decisions

1. **Proactive refresh timing**: Refresh at 80% of token lifetime (12 minutes for 15min tokens). This gives a 3-minute buffer before expiry, avoiding edge cases with clock skew and network latency.
2. **Refresh deduplication**: Use a singleton promise pattern — if a refresh is in-flight, subsequent requests wait for the same promise instead of triggering a new one. This avoids race conditions from multiple simultaneous 401s.
3. **Refresh token rotation**: On `/auth/refresh`, generate a new refresh token, update the DB, and return both new tokens. The old refresh token becomes invalid immediately. This limits the window for stolen refresh tokens.
4. **JWT secret via env**: Read `JWT_SECRET` from `process.env` with a fallback to the current hardcoded value for backward compatibility during migration.
5. **Session timeout UI**: Use a lightweight toast/modal component (no new UI library — keep it simple) that appears 1 minute before expiry, giving the user an "Extend Session" button.

## Risks / Trade-offs

- [Proactive refresh timing mismatch] → If the client clock is significantly off from server clock, the refresh may happen too early or too late. Mitigation: Use server-relative time by storing `exp` claim offset rather than client Date.now().
- [Multiple tabs] → Each tab independently manages its own refresh cycle, potentially causing redundant refresh calls. Mitigation: Acceptable trade-off for now — cross-tab sync is a non-goal.
- [Refresh failure mid-session] → If a refresh fails (network issue, server down), the user loses session state. Mitigation: Retry once after a short delay, then show the session timeout UI.
- [Backward compatibility for JWT secret] → Fallback to hardcoded value means existing setups keep working. Mitigation: Log a warning if the env var is not set.
