## Context

The auth system currently issues JWT access tokens with 15-minute expiry (`'15m'`). The frontend dynamically calculates refresh timing from the JWT's `exp` and `iat` claims — it refreshes at 80% of lifetime and warns 60s before expiry. The `session-timeout` spec documents the 80% threshold as 12 minutes.

User feedback indicates 15 minutes is too short, causing disruptive logouts during active use.

## Goals / Non-Goals

**Goals:**
- Extend access token lifetime from 15 minutes to 60 minutes
- Update the `session-timeout` spec to reflect the new threshold (48 min at 80%)
- Remove the "session expires regardless of activity" stale bug reference

**Non-Goals:**
- No changes to refresh token lifetime (remains 7 days)
- No changes to the 60-second warning window
- No API contract changes (response shapes remain identical)
- No frontend code changes needed (timing is computed from JWT claims dynamically)

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Backend token value | `'1h'` | jsonwebtoken string format, one-line change, zero risk |
| Frontend changes | None required | `scheduleTokenRefresh()` derives timers from `exp - iat`, so 60min tokens automatically trigger refresh at 48min and warning at 59min |
| `session-timeout` spec update | Delta: 12 min → 48 min | The behavior doesn't change, only the documented numeric values |

## Risks / Trade-offs

- **[Low] Longer-lived JWTs**: A leaked token is usable for up to 60 minutes instead of 15. Mitigation: refresh token rotation (already in session-timeout spec) limits damage; 7-day refresh tokens remain unchanged.
- **[Low] Stale browser tabs**: Tabs left open for >60 min will silently log out on next action — same behavior as before, just a longer window.
