## 0. Worktree Setup

- [x] 0.1 Crear directorio `worktrees/` en la raíz del proyecto
- [x] 0.2 Crear y publicar feature branch `feat/add-logout-button` desde `main`
- [x] 0.3 Agregar git worktree: `git worktree add worktrees/add-logout-button feat/add-logout-button`
- [x] 0.4 Verificar que el worktree está activo y en el branch correcto

## 1. AuthContext Changes

- [x] 1.1 Make `logout()` async: change return type from `void` to `Promise<void>`, add `await api.auth.logout()`, and wrap in try/catch
- [x] 1.2 Add post-logout redirect: use `useNavigate` to navigate to `/login` after successful logout

## 2. Navbar Changes

- [x] 2.1 Add confirmation dialog: call `window.confirm()` before invoking logout
- [x] 2.2 Style logout button: apply `text-red-400 hover:text-red-300` Tailwind classes
- [x] 2.3 Update to handle async logout: `onClick` handler should be async and await logout

## 3. API Layer Cleanup

- [x] 3.1 Remove duplicate `clearTokens()` call from `api.auth.logout()` — AuthContext already handles it
