## 1. Backend: Refresh Token Rotation

- [x] 1.1 Update `POST /auth/refresh` to generate and persist a new refresh token, invalidating the old one
- [x] 1.2 Verify old refresh token is rejected after rotation

## 2. Backend: JWT Secret via Environment Variable

- [x] 2.1 Read `JWT_SECRET` from `process.env.JWT_SECRET` with fallback to hardcoded value
- [x] 2.2 Log a warning when `JWT_SECRET` env var is not set

## 3. Frontend: Proactive Token Refresh
cat openspec/changes/fix-session-timeout/tasks.md | grep -E "\[ \]|\[x\]"
- [x] 3.1 Decode JWT on client to extract `exp` claim
- [x] 3.2 Schedule proactive refresh at 80% of token lifetime
- [x] 3.3 Update `fetchWithAuth` to use proactive refresh instead of 401-triggered refresh

## 4. Frontend: Refresh Deduplication

- [x] 4.1 Implement singleton promise pattern for refresh calls
- [x] 4.2 Queue pending requests during refresh and retry with new token

## 5. Frontend: Session Timeout UI

- [x] 5.1 Build toast/modal component showing "Your session is about to expire" with "Extend Session" button
- [x] 5.2 Wire expiry warning to fire 1 minute before token expiry
- [x] 5.3 Handle "Extend Session" action to call refresh and dismiss notification
- [x] 5.4 Handle session expiry (redirect to `/login`, clear tokens)
