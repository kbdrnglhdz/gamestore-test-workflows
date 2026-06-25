## Context

The auth system issues JWT access tokens with 15-minute expiry (`'15m'`). The frontend dynamically calculates refresh timing from JWT's `exp` and `iat` claims — refreshing at 80% of lifetime and warning 60s before expiry. The 15-minute window is too short for active users.

## Goals / Non-Goals

**Goals:**
- Extend access token lifetime from 15 minutes to 30 minutes
- Update the `session-timeout` spec to reflect the new threshold (24 min at 80%)

**Non-Goals:**
- No changes to refresh token lifetime (remains 7 days)
- No changes to the 60-second warning window
- No API contract changes
- No frontend code changes needed (timing is computed from JWT claims dynamically)

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Backend token value | `'30m'` | jsonwebtoken string format, one-line change |
| Frontend changes | None required | `scheduleTokenRefresh()` derives timers from `exp - iat` |
| `session-timeout` spec update | Delta: 12 min → 24 min | The behavior doesn't change, only the documented threshold |

## Risks / Trade-offs

- **[Low] Longer-lived JWTs**: A leaked token is usable for up to 30 minutes instead of 15. Mitigation: refresh token rotation is already specified; 30 min is still within standard practice.
