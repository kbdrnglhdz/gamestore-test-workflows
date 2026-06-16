# Graph Report - .  (2026-06-08)

## Corpus Check
- Corpus is ~26,816 words - fits in a single context window. You may not need a graph.

## Summary
- 243 nodes · 342 edges · 25 communities (14 shown, 11 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Frontend React UI|Frontend React UI]]
- [[_COMMUNITY_Backend API Routes|Backend API Routes]]
- [[_COMMUNITY_Backend Dependencies|Backend Dependencies]]
- [[_COMMUNITY_Project Configuration & Docs|Project Configuration & Docs]]
- [[_COMMUNITY_OpenSpec OPSX Commands|OpenSpec OPSX Commands]]
- [[_COMMUNITY_Frontend Dependencies|Frontend Dependencies]]
- [[_COMMUNITY_Frontend TSConfig|Frontend TSConfig]]
- [[_COMMUNITY_Backend TSConfig|Backend TSConfig]]
- [[_COMMUNITY_Vite TSConfig|Vite TSConfig]]
- [[_COMMUNITY_OpenCode Plugin Config|OpenCode Plugin Config]]
- [[_COMMUNITY_OpenCode Dependencies|OpenCode Dependencies]]
- [[_COMMUNITY_Data Model Interfaces|Data Model Interfaces]]
- [[_COMMUNITY_Vite Dev Proxy|Vite Dev Proxy]]
- [[_COMMUNITY_User Interfaces|User Interfaces]]
- [[_COMMUNITY_Frontend Deps Node|Frontend Deps Node]]
- [[_COMMUNITY_Tailwind Theme|Tailwind Theme]]
- [[_COMMUNITY_PostCSS Plugins|PostCSS Plugins]]
- [[_COMMUNITY_Admin Order Interfaces|Admin Order Interfaces]]
- [[_COMMUNITY_Admin Stats Interfaces|Admin Stats Interfaces]]
- [[_COMMUNITY_Frontend Entry HTML|Frontend Entry HTML]]
- [[_COMMUNITY_TypeScript Base Config|TypeScript Base Config]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `useAuth()` - 15 edges
3. `compilerOptions` - 12 edges
4. `authenticate()` - 12 edges
5. `api` - 11 edges
6. `router` - 11 edges
7. `OpenSpec Onboarding Skill` - 11 edges
8. `useCart()` - 10 edges
9. `router` - 8 edges
10. `router` - 8 edges

## Surprising Connections (you probably didn't know these)
- `router` --implements--> `Auth Specification`  [EXTRACTED]
  backend/src/routes/auth.ts → openspec/specs/auth/spec.md
- `Agent Instructions` --references--> `router`  [EXTRACTED]
  AGENTS.md → backend/src/routes/auth.ts
- `Agent Instructions` --references--> `authenticate()`  [EXTRACTED]
  AGENTS.md → backend/src/middleware/auth.ts
- `Broken Pagination Bug` --conceptually_related_to--> `Catalog Specification`  [INFERRED]
  backend/src/routes/products.ts → openspec/specs/catalog/spec.md
- `Price String Bug` --conceptually_related_to--> `Catalog Specification`  [INFERRED]
  backend/src/routes/products.ts → openspec/specs/catalog/spec.md

## Communities (25 total, 11 thin omitted)

### Community 0 - "Frontend React UI"
Cohesion: 0.09
Nodes (37): AppRoutes Root Component, ProtectedRoute Component, Navbar(), AuthContext, AuthContextType, AuthProvider(), useAuth(), User (+29 more)

### Community 1 - "Backend API Routes"
Cohesion: 0.13
Nodes (21): authenticate(), AuthRequest, generateRefreshToken(), generateToken(), verifyRefreshToken(), prisma, decoded, prisma (+13 more)

### Community 2 - "Backend Dependencies"
Cohesion: 0.07
Nodes (26): dependencies, bcryptjs, cors, express, jsonwebtoken, @prisma/client, description, devDependencies (+18 more)

### Community 3 - "Project Configuration & Docs"
Cohesion: 0.15
Nodes (23): Agent Instructions, Database Migration Schema, Backend Package Manifest, OpenSpec Configuration, Auth Specification, Catalog Specification, main(), prisma (+15 more)

### Community 4 - "OpenSpec OPSX Commands"
Cohesion: 0.12
Nodes (23): OPSX Apply Command, OPSX Archive Command, OPSX Bulk Archive Command, OPSX Continue Command, OPSX Explore Command, OPSX Fast-Forward Command, OPSX New Command, OPSX Onboard Command (+15 more)

### Community 5 - "Frontend Dependencies"
Cohesion: 0.09
Nodes (21): dependencies, react, react-dom, react-router-dom, devDependencies, autoprefixer, postcss, tailwindcss (+13 more)

### Community 6 - "Frontend TSConfig"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+10 more)

### Community 7 - "Backend TSConfig"
Cohesion: 0.13
Nodes (14): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, lib, module, outDir, resolveJsonModule (+6 more)

### Community 8 - "Vite TSConfig"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 9 - "OpenCode Plugin Config"
Cohesion: 0.40
Nodes (4): plugin, $schema, Plugin Package Manifest, Graphify Plugin

## Knowledge Gaps
- **134 isolated node(s):** `target`, `useDefineForClassFields`, `lib`, `module`, `skipLibCheck` (+129 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `authenticate()` connect `Backend API Routes` to `Project Configuration & Docs`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `router` connect `Backend API Routes` to `Project Configuration & Docs`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `Database Migration Schema` connect `Project Configuration & Docs` to `Backend API Routes`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `target`, `useDefineForClassFields`, `lib` to the rest of the system?**
  _139 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Frontend React UI` be split into smaller, more focused modules?**
  _Cohesion score 0.08705882352941176 - nodes in this community are weakly interconnected._
- **Should `Backend API Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.12698412698412698 - nodes in this community are weakly interconnected._
- **Should `Backend Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._