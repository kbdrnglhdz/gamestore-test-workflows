## Context

The logout button exists in `Navbar.tsx` and calls `AuthContext.logout()`, which fires `api.auth.logout()` without `await`, clears tokens, and resets user state. No redirect occurs after logout. The backend `POST /api/auth/logout` correctly invalidates the refresh token.

## Goals / Non-Goals

**Goals:**
- Properly await the backend logout API call before clearing client state
- Redirect to `/login` after successful logout
- Show a confirmation dialog before logging out
- Style the logout button as a destructive action

**Non-Goals:**
- No new backend endpoints or database changes
- No changes to login, register, or refresh flows

## Decisions

1. **`AuthContext.logout()` becomes async** — Change signature from `() => void` to `() => Promise<void>` so callers can `await` the API call before navigating. The API call failure is non-blocking (still proceed with local cleanup).

2. **Redirect via `useNavigate`** — Use React Router's `useNavigate` hook for a client-side redirect to `/login` after logout, avoiding a full page reload.

3. **Confirmation dialog** — Use a simple `window.confirm()` for the confirmation to avoid new dependencies. Alternatively, a lightweight custom modal if we want better UX. `window.confirm()` is simpler and avoids adding a dialog library.

4. **Navbar styling** — Use `text-red-400 hover:text-red-300` Tailwind classes to make the logout button visually distinct.

## Risks / Trade-offs

- Making `logout()` async is a breaking change for any code that calls it synchronously — but only Navbar uses it.
- `window.confirm()` is basic UX but avoids dependency bloat; can be upgraded to a modal later.
