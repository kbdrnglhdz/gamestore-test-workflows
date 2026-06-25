## 1. Setup

- [x] 1.1 Crear rama `feature/test-ci-1-reviews` (5 min)

## 2. Database

- [x] 2.1 Añadir modelo `Review` en `backend/prisma/schema.prisma` con campos `userId`, `productId`, `rating` (Int), `comment` (String), `createdAt`, y unique constraint `(userId, productId)` (15 min)
- [x] 2.2 Ejecutar `prisma migrate dev` para generar migración y actualizar cliente (5 min)

## 3. Backend — Route Handler

- [x] 3.1 Crear `backend/src/routes/reviews.ts` con router Express, importando PrismaClient y authenticate middleware (30 min)
- [x] 3.2 Implementar `GET /:id/reviews` — validar producto existe, devolver reviews con `findMany` (15 min)
- [x] 3.3 Implementar `POST /:id/reviews` — validar producto existe, validar rating (1-5 entero), validar comment no vacío, crear review con `req.userId` del token, manejar unique constraint violation (30 min)
- [x] 3.4 Registrar en `backend/src/index.ts` el router de reviews bajo `/api/products` (5 min)

## 4. Backend — Tests

- [x] 4.1 Crear `backend/src/__tests__/reviews.test.ts` con tests para GET (éxito, producto sin reviews, producto no existe) (20 min)
- [x] 4.2 Añadir tests para POST (éxito, sin auth, rating inválido, comment vacío, review duplicada) (20 min)

## 5. Verificación Manual

- [x] 5.1 Arrancar backend y probar GET /api/products/1/reviews devuelve array vacío (5 min)
- [x] 5.2 Probar POST /api/products/1/reviews con token válido y datos correctos devuelve 201 (5 min)
- [x] 5.3 Probar POST sin token devuelve 401 (5 min)
- [x] 5.4 Probar POST con rating 0 y 6 devuelve 400 (5 min)
- [x] 5.5 Probar POST duplicado para mismo producto/usuario devuelve 409 (5 min)
- [x] 5.6 Probar GET/POST para producto inexistente devuelve 404 (5 min)
