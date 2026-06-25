# Estándares Técnicos — Backend: Node.js + Express + TypeScript + Prisma

## 1. Prácticas Recomendadas

| Práctica | Implementación |
|---|---|
| **Manejo de errores** | Middleware de error Express (4 params: `err, req, res, next`). Definir al final del pipeline después de todas las rutas. Propagar errores con `next(err)`. Responder `{ error: message }` con status code. |
| **Logging** | `console.error` en error middleware. Para producción: librería como `winston` o `pino`. |
| **Validación** | Validación manual en route handlers (checks de tipos, rangos, existencia). Alternativa: `express-validator` o `zod` para validación declarativa. |
| **Testing** | `vitest` + `supertest`. Tests de integración contra Express app. Prisma mockeado o base de datos de test separada. |
| **Seguridad** | `jsonwebtoken` para JWT. `bcryptjs` para hashear passwords (nunca texto plano). `cors` configurado. |
| **Configuración** | Variables de entorno via `process.env`. `.env` para desarrollo. `tsconfig.json` con `strict: true`. |

## 2. Principios de Diseño

| Principio | Aplicación |
|---|---|
| **SRP** | Route handlers delgados (solo HTTP). Lógica de negocio en funciones separadas o servicios. Módulos por dominio (products, auth, cart). |
| **OCP** | Middleware chain extensible. Routers modulares con `express.Router()`. |
| **DIP** | Dependencias inyectadas como parámetros de función o módulos importados. Prisma Client como singleton. |
| **DRY** | Middleware reutilizable (`authenticate`, `fetchWithAuth`). Funciones helpers compartidas entre rutas. |
| **KISS** | Express minimalista. Sin capas innecesarias. Lógica directa en handlers cuando es simple. |

## 3. Patrones de Diseño

| Patrón | Propósito | Implementación |
|---|---|---|
| **Route Handler** | Manejo de HTTP requests | Funciones async en `express.Router()`. `try/catch` con `next(err)`. |
| **Middleware Chain** | Procesamiento en pipeline | `app.use(middleware)` en orden. Desde genéricos (CORS, JSON parse) hasta específicos (auth, rutas). Error handler al final. |
| **Prisma Client** | Acceso a base de datos | Singleton `PrismaClient`. Operaciones directas: `prisma.model.findMany()`, `prisma.model.create()`, etc. Transacciones con `prisma.$transaction()`. |
| **DTO / Response Shape** | Forma de respuesta consistente | Objetos planos retornados en `res.json()`. Interfaces TypeScript para tipar request body y response. |
| **Module Router** | Organización por feature | `express.Router()` por módulo (auth, products, cart, orders, admin). Montados en `app.use('/api/products', router)`. |

## 4. Base de Datos / Prisma

| Aspecto | Implementación |
|---|---|
| **ORM** | Prisma Client. Esquema declarativo en `schema.prisma`. `prisma generate` para cliente type-safe. |
| **Migraciones** | `prisma migrate dev` para desarrollo. Archivos SQL en `prisma/migrations/`. |
| **Seed** | `prisma/seed.ts` con `prisma.$transaction()` para datos iniciales. Ejecutar con `prisma db seed`. |
| **Paginación** | `skip` + `take` nativos de Prisma. Parámetros: `?page=1&limit=20&sort=price_asc`. |
| **Consultas** | Query methods type-safe: `findUnique`, `findMany`, `create`, `update`, `delete`. `include` para relaciones. Raw queries con `$queryRaw` solo cuando es necesario. |
| **Transacciones** | `prisma.$transaction()` para operaciones atómicas (ej: checkout que crea orden + decrementa stock + limpia carrito). |
| **Pool** | SQLite no requiere pool. Para PostgreSQL/MySQL, Prisma maneja pooling automáticamente. |

## 5. API REST / Contrato

| Aspecto | Implementación |
|---|---|
| **Formato** | JSON. Respuesta de error: `{ error: string, details?: any }`. |
| **Paginación** | Parámetros `?page=1&limit=20&sort=price_asc&category=RPG`. |
| **Códigos HTTP** | 200 OK, 201 creado, 400 bad request, 401 no auth, 403 forbidden, 404 not found, 500 server error. |
| **Auth** | `Authorization: Bearer <JWT>` en cada request protegido. Refresh token en body de `POST /auth/refresh`. |
| **Prefix** | `/api/{recurso}`. Ej: `/api/products`, `/api/cart`, `/api/orders`. |

## 6. Autenticación JWT

| Aspecto | Implementación |
|---|---|
| **Access Token** | `jsonwebtoken.sign({ userId, role }, secret, { expiresIn: '1h' })`. |
| **Refresh Token** | `jsonwebtoken.sign({ userId }, secret, { expiresIn: '7d' })`. Almacenado en DB (columna `refreshToken`). |
| **Middleware auth** | Extrae Bearer token, verifica con `jwt.verify()`, setea `req.userId` y `req.userRole`. 401 si inválido/expirado. |
| **Passwords** | `bcryptjs.hash(password, 10)` para almacenar. `bcryptjs.compare(password, hash)` para verificar. |
| **Refresh flow** | `POST /auth/refresh` recibe refresh token, verifica contra DB, emite nuevo par de tokens. |

## 7. Testing

| Aspecto | Implementación |
|---|---|
| **Framework** | `vitest` + `supertest`. |
| **Estructura** | Tests de integración contra `app` exportada de `index.ts`. |
| **Setup** | `beforeAll`: levantar app. `afterAll`: cerrar Prisma + servidor. |
| **Patrón** | Describe → it → request → assert status + body. Uso de `describe.each` para casos parametrizados. |
| **Coverage** | Happy path + edge cases: carrito vacío, stock insuficiente, producto no encontrado, auth inválida. |

## 8. Estructura de Proyecto

```
backend/
├── src/
│   ├── index.ts                 # Express app, middleware global, montaje de routers, error handler
│   ├── middleware/
│   │   └── auth.ts              # authenticate(), generateToken(), generateRefreshToken()
│   ├── routes/
│   │   ├── auth.ts              # POST /register, /login, /refresh, /logout, GET /me
│   │   ├── products.ts          # GET /, GET /:id, POST /, PUT /:id, DELETE /:id
│   │   ├── cart.ts              # GET /, POST /add, PUT /item/:id, DELETE /item/:id, DELETE /clear
│   │   ├── orders.ts            # POST /checkout, GET /, GET /:id
│   │   └── admin.ts             # GET /users, /orders, /stats, PUT /orders/:id/status
│   └── __tests__/
│       ├── products.test.ts
│       └── orders.test.ts
├── prisma/
│   ├── schema.prisma            # Modelos: User, Product, Cart, CartItem, Order, OrderItem
│   ├── migrations/              # Migraciones generadas por Prisma
│   └── seed.ts                  # Datos de prueba (usuarios + 50 productos)
├── package.json
└── tsconfig.json                # strict: true, ES2020, commonjs
```

## 9. Convenciones de Código

| Aspecto | Convención |
|---|---|
| **Nomenclatura** | `camelCase` variables/funciones, `PascalCase` tipos/interfaces, `UPPER_SNAKE` constantes |
| **Tipado** | Interfaces para request body, response, y modelos. `AuthRequest` extiende `Request` con `userId` y `userRole`. Evitar `any`. |
| **Async** | Route handlers async con `try/catch`. Errores propagados con `next(err)`. |
| **Prisma** | `prisma` como singleton importado. Cada handler usa `prisma.model.method()`. |
| **Config** | `process.env.PORT`, `process.env.JWT_SECRET`, `process.env.DATABASE_URL`. Secretos nunca hardcodeados. |
| **Testing** | `supertest(app)` para requests HTTP. Assert sobre status + body. Tests descriptivos con mensajes claros. |

---

## 10. Ejemplos BAD vs GOOD

Ver [`examples-backend.md`](./examples-backend.md) para ejemplos contrastantes de cada bug conocido en el backend, con la solución correcta según los estándares documentados arriba.

| # | Ejemplo | Secciones relacionadas |
|---|---------|----------------------|
| 1 | Passwords en texto plano → bcryptjs | §1 Seguridad, §6 Autenticación JWT |
| 2 | JWT secret hardcodeado → env var | §6 Autenticación JWT, §9 Config |
| 3 | Paginación skip:0 → skip calculado | §4 Paginación, §5 API REST |
| 4 | Price como String → Float | §4 ORM, §9 Tipado |
| 5 | Cart items duplicados → upsert | §3 Prisma Client, §4 Consultas |
| 6 | Sin validación de stock → transacción | §4 Transacciones, §5 Códigos HTTP |
| 7 | Admin sin role check → middleware | §3 Middleware Chain, §6 Auth |
| 8 | Error handler disperso → centralizado | §1 Manejo de errores, §3 Middleware Chain |
| 9 | Refresh token nunca renovado → rotación | §6 Refresh flow |
| 10 | Lógica en handlers → service layer | §2 SRP, §3 Route Handler / Service |
