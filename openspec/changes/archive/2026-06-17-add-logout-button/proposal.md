## Why

The logout button exists in the UI but has rough edges: the API call is fire-and-forget (backend token invalidation may not complete), there's no post-logout redirect, and no visual confirmation before logging out.

## What Changes

- Fix `AuthContext.logout()` to properly await the backend logout API call
- Add navigation to `/login` after successful logout
- Add a confirmation dialog before logging out
- Move logout button styling to be visually distinct (red/destructive style)
- Update auth spec to reflect improved logout behavior

## Capabilities

### New Capabilities
- `logout-confirmation`: Confirmation dialog before logging out

### Modified Capabilities
- `auth`: Update User Logout requirement to include post-logout redirect and proper async handling

## Impact

- Frontend: `AuthContext.tsx` (fix async logout flow, add redirect), `Navbar.tsx` (confirmation dialog, button styling), `api.ts` (remove redundant `clearTokens` from `api.auth.logout`)
- No backend changes needed — `POST /api/auth/logout` already exists and works correctly
