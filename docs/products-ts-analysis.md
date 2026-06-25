# Análisis de `backend/src/routes/products.ts`

> Generado por graphify query sobre el grafo de conocimiento del proyecto.

## Graph Context

```
Traversal: BFS | Start: AppRoutes(), Price String Bug, Broken Pagination Bug, price, API Proxy to Backend
91 nodos explorados | 5 comunidades involucradas
```

products.ts es un nodo hub que conecta: **Backend API Routes**, **Project Configuration & Docs**, **Frontend React UI**, **Catalog Specification**, **Data Model Interfaces**.

## Estructura Actual

`backend/src/routes/products.ts` (140 líneas) expone 5 endpoints REST:

| Método | Ruta | Auth | Propósito |
|--------|------|------|-----------|
| GET | `/` | No | Listar productos con paginación, filtros, búsqueda y orden |
| GET | `/:id` | No | Producto individual por ID |
| POST | `/` | Sí (authenticate) | Crear producto |
| PUT | `/:id` | Sí (authenticate) | Actualizar producto |
| DELETE | `/:id` | Sí (authenticate) | Eliminar producto |

### Endpoints en detalle

**`GET /`** — Listado con paginación
- Parámetros: `page`, `limit`, `category`, `minPrice`, `maxPrice`, `sort`, `search`
- Filtros: categoría exacta, búsqueda por `startsWith` en nombre, rango de precio
- Orden: por defecto `createdAt: 'desc'`; soporta `price_asc` / `price_desc`
- Paginación: `skip` calculado correctamente como `(pageNum - 1) * limitNum`
- Responde: `{ products, total, page, totalPages }`

**`GET /:id`** — Producto individual
- Busca por ID (parseado a entero)
- Retorna 404 si no existe

**`POST /`** — Crear producto (requiere auth)
- Body: `name`, `description`, `price`, `image`, `stock`, `category`
- Sin validación de entrada

**`PUT /:id`** — Actualizar producto (requiere auth)
- Mismos campos que POST
- Sin validación de entrada

**`DELETE /:id`** — Eliminar producto (requiere auth)
- Eliminación física (no soft-delete)

## Bugs Conocidos (del grafo + código fuente)

| Bug | Descripción | Fuente |
|-----|-------------|--------|
| **Broken Pagination Bug** | `skip: 0` hardcodeado — página 2 devuelve lo mismo que página 1 | products.ts |
| **Price String Bug** | `price` almacenado como `String` — ordenamiento alfabético en lugar de numérico | products.ts |
| **N+1 query** | `findMany` por producto individual en lugar de query optimizada | products.ts:45 |
| **Sin caché** | Cada request golpea la BD directamente | products.ts:17-18 |
| **Sin validación** | POST/PUT aceptan cualquier valor sin sanitización | products.ts:84-94 |
| **Imagen localhost** | `image` guarda ruta absoluta apuntando a localhost | products.ts:91 |

## Conexiones Relevantes en el Grafo

```
router --contains--> products.ts
router --calls--> authenticate()
router --references--> Express App Entry
router --references--> Agent Instructions

Price String Bug --rationale_for--> router
Price String Bug --conceptually_related_to--> Catalog Specification
Price String Bug --references--> Project README

Broken Pagination Bug --rationale_for--> router
Broken Pagination Bug --conceptually_related_to--> Catalog Specification
Broken Pagination Bug --references--> Project README

products.ts --uses--> prisma
products.ts --defines--> pageNum, limitNum, where, orderBy
```

## Propuestas de Nuevos Requerimientos

### 1. Catálogo con variantes de producto
Cada producto debería soportar variantes (color, talla, edición) con stock independiente. Actualmente `stock` es un campo plano en `Product`. Añadir tabla `ProductVariant` y endpoint `GET /:id/variants`.

### 2. Búsqueda avanzada con filtros combinados
La búsqueda actual solo hace `startsWith` sobre `name`. Implementar:
- Búsqueda full-text sobre `name + description`
- Filtro por rango de precio funcional (requiere migrar price a numérico)
- Facetas por categoría con conteo de resultados

### 3. Precio como tipo numérico (no String)
Migrar `price` de `String` a `Decimal` o `Float` en Prisma para que:
- `sort=price_asc` / `price_desc` ordene correctamente
- Las comparaciones `minPrice` / `maxPrice` sean precisas
- Permitir operaciones aritméticas (descuentos, impuestos)

### 4. Endpoint de reviews / valoraciones
Añadir `GET /:id/reviews` y `POST /:id/reviews` (auth required). Crear tabla `Review` con `userId`, `productId`, `rating` (1-5), `comment`, `createdAt`.

### 5. Caché con Redis o CDN para catálogo
Los productos cambian poco pero se leen mucho. Implementar:
- Caché Redis con TTL de 5 min para listado, 30 min para producto individual
- Invalidación automática en POST/PUT/DELETE
- Cabeceras `Cache-Control` en respuestas

### 6. Imágenes en storage externo (S3/Cloudinary)
Actualmente `image` guarda ruta absoluta localhost (`// BUG: Absolute path pointing to localhost`). Migrar a:
- Subida con `multer` → almacenamiento en S3/Cloudinary
- Devolver URL firmada con expiración
- Soporte para múltiples imágenes por producto

### 7. Productos relacionados / recomendaciones
Endpoint `GET /:id/related` que devuelva productos en la misma categoría o comprados juntos frecuentemente (requiere analytics de órdenes).

### 8. Soft-delete + auditoría
El DELETE actual es físico. Implementar:
- Campo `deletedAt` nullable para soft-delete
- Tabla `ProductAuditLog` con `productId`, `userId`, `action`, `changes`, `timestamp`
- Endpoint admin para ver historial de cambios

### 9. Bulk create / update
Endpoints `POST /bulk` y `PUT /bulk` para operaciones masivas desde el panel admin:
- Validación por lote con reporte de errores parciales
- Máximo 100 items por request
- Rate limiting más restrictivo que endpoints individuales

### 10. Rate limiting por endpoint
Protección contra scraping y abuso:
- `GET /` (público): 100 requests/min por IP
- `GET /:id` (público): 200 requests/min por IP
- `POST /`, `PUT /:id`, `DELETE /:id` (admin): 30 requests/min

### 11. Paginación con cursor (cursor-based)
Además de la paginación por offset, soportar paginación por cursor (`cursor` + `take`) para evitar problemas de consistencia cuando se insertan/eliminan productos entre páginas.

### 12. Endpoint de exportación
`GET /export?format=csv|json` para que admins puedan descargar el catálogo completo:
- Soporte para filtros igual que GET /
- Stream de datos para catálogos grandes
- Cabeceras de descarga (`Content-Disposition`)

## Prioridad Sugerida

| Prioridad | Requerimiento | Dependencia |
|-----------|---------------|-------------|
| 🔴 Crítica | 3. Precio como numérico | Migración Prisma |
| 🔴 Crítica | 6. Imágenes externas | Setup S3/Cloudinary |
| 🟡 Alta | 5. Caché Redis | Infra Redis |
| 🟡 Alta | 10. Rate limiting | Middleware express-rate-limit |
| 🟡 Alta | 8. Soft-delete + auditoría | Migración Prisma |
| 🟢 Media | 2. Búsqueda avanzada | Full-text search engine |
| 🟢 Media | 1. Variantes de producto | Migración Prisma + UI |
| 🟢 Media | 4. Reviews | Migración Prisma |
| 🔵 Baja | 7. Recomendaciones | Datos de órdenes |
| 🔵 Baja | 9. Bulk operations | Tests de carga |
| 🔵 Baja | 11. Paginación cursor | Refactor frontend |
| 🔵 Baja | 12. Exportación | Streaming |

---

*Generado: 2026-06-25 | Fuente: graphify knowledge graph + análisis estático de código*
