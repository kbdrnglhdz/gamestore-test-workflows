## Why

Auth error messages are inconsistent, leak internal implementation details, and have no input validation. The login/register flows expose raw `error.message` in 500 responses, and the frontend silently fails on network errors during session restoration. This leads to poor UX and potential information disclosure.

## What Changes

- **Backend auth routes**: Replace generic `catch` blocks with standardized error responses; add input validation for missing/malformed fields (email format, required fields); avoid leaking internal error details
- **Backend auth middleware**: Differentiate JWT error types (expired vs malformed vs missing) with distinct messages
- **Frontend api.ts auth methods**: Check `response.ok` before parsing JSON; handle network errors gracefully
- **Frontend Login/Register**: Preserve existing error display but support field-level validation feedback
- **Frontend AuthContext**: Handle session restoration failure with a silent redirect (no crash), and surface network errors during login/register properly

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `auth`: Update error response requirements to cover standardized shapes, input validation errors, and differentiated JWT error types

## Impact

- `backend/src/routes/auth.ts` — all route handlers need error handling updates
- `backend/src/middleware/auth.ts` — JWT error differentiation
- `frontend/src/services/api.ts` — `auth.register`, `auth.login`, `auth.me` error handling
- `frontend/src/context/AuthContext.tsx` — error propagation improvements
- `frontend/src/pages/Login.tsx` and `Register.tsx` — potential validation feedback updates
