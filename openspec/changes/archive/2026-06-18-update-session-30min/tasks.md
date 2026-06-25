## 1. Backend: Update JWT access token expiry

- [x] 1.1 Change `expiresIn` from `'15m'` to `'30m'` in `backend/src/middleware/auth.ts:36`

## 2. Verify frontend behavior

- [x] 2.1 Confirm frontend `scheduleTokenRefresh()` computes correct timers from 30min JWT (refresh at ~24min, warning at ~29min)
- [x] 2.2 Verify `session-timeout/spec.md` delta aligns with new threshold (24 min at 80%)

## 3. Update main specs (post-implementation)

- [x] 3.1 Sync delta to `openspec/specs/auth/spec.md` — update Session Persistence to 30 minutes
- [x] 3.2 Sync delta to `openspec/specs/session-timeout/spec.md` — update refresh threshold to 24 minutes
