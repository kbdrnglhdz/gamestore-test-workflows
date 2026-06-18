## 1. Git worktree setup

- [x] 1.1 Crear rama `improve-error-messages` desde `main`
- [x] 1.2 Agregar worktree en `worktrees/improve-error-messages` apuntando a la nueva rama
- [x] 1.3 Instalar dependencias en el worktree (npm install en backend/ y frontend/)
- [x] 1.4 Verificar que el worktree compila correctamente (npm run build en backend/ y frontend/)

## 2. Backend: Input validation for auth endpoints

- [x] 2.1 Add a `validate` helper in `auth.ts` for required fields and email format
- [x] 2.2 Add field validation to `POST /register` (email, password, name required; email format check)
- [x] 2.3 Add field validation to `POST /login` (email, password required; email format check)

## 3. Backend: Standardized error responses

- [x] 3.1 Add `code` field to all explicit auth error responses (e.g., `INVALID_CREDENTIALS`, `DUPLICATE_EMAIL`, `MISSING_REFRESH_TOKEN`)
- [x] 3.2 Replace generic `catch` blocks in auth routes with `{ error: "Internal server error", code: "INTERNAL_ERROR" }` (no leaking `error.message`)

## 4. Backend: JWT error differentiation

- [x] 4.1 Catch `jwt.TokenExpiredError` separately in auth middleware
- [x] 4.2 Return `{ error: "Token expired", code: "TOKEN_EXPIRED" }` for expired tokens vs `{ error: "Invalid token", code: "INVALID_TOKEN" }` for malformed tokens

## 5. Frontend: API error handling for auth methods

- [x] 5.1 Update `api.auth.login` to check `response.ok` and throw with server's `error` field; catch network errors with user-friendly message
- [x] 5.2 Update `api.auth.register` to check `response.ok` and throw with server's `error` field; catch network errors with user-friendly message
- [x] 5.3 Update `api.auth.me` to check `response.ok` and throw with server's `error` field; catch network errors with user-friendly message

## 6. Frontend: Verify error display

- [x] 6.1 Verify Login.tsx displays backend error messages and codes correctly
- [x] 6.2 Verify Register.tsx displays backend error messages and codes correctly
