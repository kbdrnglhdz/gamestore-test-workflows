## Context

Auth error handling currently uses a generic `catch (error: any) { res.status(500).json({ error: error.message }) }` pattern across all routes, leaking internal error details. The auth middleware returns a single "Invalid token" message for all JWT failures. Frontend auth methods (`login`, `register`, `me`) don't check `response.ok`, so network errors and non-2xx responses are handled inconsistently. No input validation exists on the backend for required fields or email format.

## Goals / Non-Goals

**Goals:**
- Standardized error response shape across all auth endpoints (`{ error: string, code?: string }`)
- Input validation for required fields (email, password, name) and email format
- Differentiated JWT error messages (expired vs malformed vs missing)
- Frontend error propagation that checks HTTP status and handles network failures
- Consistent error display in Login/Register forms

**Non-Goals:**
- Changing error handling outside auth (products, cart, orders, admin)
- Implementing password hashing (separate concern)
- Adding rate limiting or brute-force protection
- Creating a global error class hierarchy for the whole backend

## Decisions

1. **Backend validation helper** — A `validate` utility in the auth route will check required fields and email format before any Prisma operation. This keeps validation explicit and avoids touching shared middleware.
2. **Error response shape** — Use `{ error: string, code?: string }` where `code` is an optional machine-readable string (e.g., `"VALIDATION_ERROR"`, `"INVALID_CREDENTIALS"`). The frontend can use `code` for i18n or specific UI handling while `error` remains the user-facing message.
3. **JWT error differentiation** — In `auth.ts` middleware, catch `jwt.TokenExpiredError` and `jwt.JsonWebTokenError` separately to return "Token expired" vs "Invalid token". This helps the frontend distinguish session expiry from corrupted tokens.
4. **Frontend API error handling** — Wrap `api.auth.login`/`register`/`me` to check `response.ok`. On non-2xx, parse the body and throw an Error with the server's `error` field. On network failure, throw a generic "Network error. Please check your connection." message.
5. **No new frontend component** — Reuse the existing `{error && <div>...</div>}` pattern in Login.tsx and Register.tsx. No toast library or error boundary needed for auth scope.

## Risks / Trade-offs

- **Risk**: Adding `code` field may be unused by frontend initially → Acceptable; it's optional and backward-compatible.
- **Risk**: Email format validation on backend may conflict with frontend `type="email"` validation → They complement each other; backend validation is the security boundary.
