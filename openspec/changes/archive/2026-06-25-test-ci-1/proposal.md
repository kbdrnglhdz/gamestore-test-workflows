## Why

Actualmente los usuarios no pueden dejar valoraciones ni opiniones sobre los productos. Esto limita la interacción y la confianza en la plataforma. Implementar un sistema de reviews permite a los usuarios compartir su experiencia y ayuda a otros compradores a tomar decisiones informadas.

## What Changes

- Nueva tabla `Review` en la base de datos con `userId`, `productId`, `rating` (1-5), `comment`, `createdAt`
- Nuevo endpoint `GET /api/products/:id/reviews` — devuelve las reviews de un producto
- Nuevo endpoint `POST /api/products/:id/reviews` — crea una review (requiere autenticación)
- Validación: rating entre 1-5, comment obligatorio
- Migración de Prisma para la nueva tabla

## Capabilities

### New Capabilities
- `reviews`: Sistema de valoraciones y reseñas de productos, incluyendo creación y consulta de reviews con rating y comentario

### Modified Capabilities
<!-- Ninguna — los specs existentes (auth, cart, catalog) no cambian su comportamiento -->

## Impact

- **Backend**: Nuevo route handler `backend/src/routes/reviews.ts`, nuevo modelo Prisma `Review`
- **Database**: Migración SQLite para crear tabla `Review`
- **Auth middleware**: El endpoint POST requiere autenticación vía `authenticateToken`
- **Frontend**: No requiere cambios (solo API)

## Riesgos

- **Riesgo**: Usuario pueda review el mismo producto múltiples veces. **Mitigación**: Unique constraint sobre `(userId, productId)` en la tabla Review.

## Complejidad

**Baja** — cambios localizados en backend, tabla simple sin relaciones complejas.

## Dependencias externas

Ninguna. Todo se implementa con Express, Prisma y SQLite existentes.
