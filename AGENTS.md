# AGENTS.md

## Repo purpose
E-commerce workshop app (Node/Express/TypeScript backend + React/Vite/Tailwind frontend) with intentional bugs for OpenSpec practice.

## Commands

### Backend (`backend/`)
- `npm run dev` — dev server on `:3001` (ts-node-dev, auto-restart)
- `npm run prisma:generate` — generate Prisma client
- `npm run prisma:migrate` — apply migrations (SQLite at `prisma/dev.db`)
- `npm run prisma:seed` — seed test users + 50 products
- `npm run build` / `npm start` — compile + run from `dist/`

### Frontend (`frontend/`)
- `npm run dev` — Vite dev server on `:5173` (proxies `/api` to `:3001`)
- `npm run build` — `tsc && vite build`

### Full dev start (order matters)
1. Backend: `cd backend && npm run prisma:generate && npm run prisma:migrate && npm run prisma:seed && npm run dev`
2. Frontend: `cd frontend && npm run dev`

## Architecture
- **No monorepo tool** — two independent npm packages in `backend/` and `frontend/`
- **No test suite, no lint, no typecheck scripts** — verify manually
- **API**: Express routes under `backend/src/routes/` (auth, products, cart, orders, admin)
- **Auth middleware**: `backend/src/middleware/auth.ts` — JWT with hardcoded secret
- **Frontend API layer**: `frontend/src/services/api.ts` — raw fetch, token management in localStorage
- **State**: `AuthContext` (user session) and `CartContext` (cart state) — cart lost on reload (bug)
- **OpenSpec**: `openspec/` directory with config + specs (`auth`, `catalog`) + change archive
- **OpenCode skills**: 10+ OpenSpec skills in `.opencode/skills/` — use `openspec-*` skills for workflow

## Known bugs (workshop)
Every bug is marked with `// FIXME:` or `// TODO:` comments in the source. Documented in `README.md`. Key ones:
- Passwords stored in plain text (no bcrypt)
- Products page 2 returns same as page 1 (`skip: 0` hardcoded)
- Price stored as `String`, sorts alphabetically
- Cart items duplicate instead of incrementing quantity
- No stock validation in cart/checkout
- No admin role check — any auth'd user can access admin panel
- Refresh token never renewed
- Cart not cleared after checkout

## Test users
| Email | Password | Role |
|---|---|---|
| admin@gamestore.com | admin123 | admin |
| user1@test.com | pass123 | user |
