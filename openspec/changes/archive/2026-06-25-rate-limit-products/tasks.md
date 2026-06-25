## 1. Setup

- [x] 1.1 Crear rama `feature/rate-limit-products`
- [x] 1.2 Instalar dependencia `express-rate-limit` en `backend/package.json`

## 2. Backend - Middleware

- [x] 2.1 Crear `backend/src/middleware/rateLimiter.ts` con factories `publicLimiter` (30 req/min) y `writeLimiter` (15 req/min)

## 3. Backend - Routes

- [x] 3.1 Agregar `publicLimiter` a `GET /api/products` y `GET /api/products/:id` en `products.ts`
- [x] 3.2 Agregar `writeLimiter` a `POST /`, `PUT /:id`, `DELETE /:id` en `products.ts` (después de `authenticate`)

## 4. Testing

- [x] 4.1 Mockear `express-rate-limit` en tests existentes de products para que sigan pasando
- [x] 4.2 Agregar test de rate limiting: verificar que tras 30 GET requests el 31ro retorna 429
- [x] 4.3 Agregar test de rate limiting: verificar que headers `X-RateLimit-Remaining` y `Retry-After` están presentes en respuesta 429
- [x] 4.4 Agregar test de rate limiting: verificar que el contador se resetea tras la ventana de tiempo

## 5. Verificación

- [x] 5.1 Smoke test: iniciar servidor, hacer 31 GET requests a `/api/products` y verificar que la 31ra da 429
- [x] 5.2 Smoke test: verificar que requests autenticados POST/PUT/DELETE respetan su límite de 15/min
- [x] 5.3 Smoke test: verificar que headers de rate limit están presentes en respuestas normales y 429
