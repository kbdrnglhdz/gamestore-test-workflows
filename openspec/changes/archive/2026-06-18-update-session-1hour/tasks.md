## 1. Backend: Update JWT access token expiry

- [x] 1.1 Change `expiresIn` from `'15m'` to `'1h'` in `backend/src/middleware/auth.ts:36`

## 2. Verify frontend behavior

- [x] 2.1 Confirm frontend `scheduleTokenRefresh()` computes correct timers from 60min JWT (refresh at ~48min, warning at ~59min)
- [x] 2.2 Verify `session-timeout/spec.md` delta aligns with new threshold (48 min at 80%)

## 3. Update main specs (post-implementation)

- [x] 3.1 Sync delta to `openspec/specs/auth/spec.md` — update Session Persistence to 60 minutes
- [x] 3.2 Sync delta to `openspec/specs/session-timeout/spec.md` — update refresh threshold to 48 minutes
