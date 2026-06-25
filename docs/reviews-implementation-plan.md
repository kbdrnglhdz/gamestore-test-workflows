# Plan: Calificación de Productos (1-5 estrellas)

## Objetivo

Permitir a los usuarios calificar productos del 1 al 5 estrellas directamente desde el catálogo, ver el promedio de calificación en cada tarjeta de producto y almacenar reseñas opcionales.

---

## 1. Base de datos — Modelo `Review`

### Schema (`backend/prisma/schema.prisma`)

Nuevo modelo `Review`:

```prisma
model Review {
  id        Int      @id @default(autoincrement())
  userId    Int
  productId Int
  rating    Int      // 1-5
  comment   String?
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id])
  product Product @relation(fields: [productId], references: [id])

  @@unique([userId, productId])  // un review por usuario por producto
}
```

Agregar `reviews Review[]` a los modelos `User` y `Product`.

### Seed (`backend/prisma/seed.ts`)

Agregar ~10 reseñas de ejemplo distribuidas entre productos y usuarios.

### Migración

Ejecutar `npx prisma migrate dev --name add_reviews` + `npx prisma generate`.

---

## 2. Backend — Rutas de Reviews

### Opción: extender `products.ts`

Agregar al router existente de productos:

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/products/:id/reviews` | No | Lista reseñas del producto (con nombre de usuario) |
| `POST` | `/products/:id/reviews` | Sí | Crear/actualizar reseña (rating 1-5, comment opcional) |
| `GET` | `/products` (modificado) | No | Incluye `averageRating` y `reviewCount` |

### Productos con calificación (`GET /api/products`)

Modificar la query de listado para incluir agregado de ratings:

```ts
const products = await prisma.product.findMany({
  where,
  skip,
  take: limitNum,
  orderBy,
  include: {
    reviews: {
      select: { rating: true }
    }
  }
});
```

Mapear a `averageRating` y `reviewCount` en la respuesta.

### Crear/actualizar reseña (`POST /api/products/:id/reviews`)

- Validar rating entre 1-5
- Usar `upsert` para evitar duplicados por userId + productId
- Retornar la reseña creada

```ts
const review = await prisma.review.upsert({
  where: {
    userId_productId: { userId: req.user.id, productId: parseInt(id) }
  },
  update: { rating, comment },
  create: { userId: req.user.id, productId: parseInt(id), rating, comment }
});
```

### Obtener reseñas (`GET /api/products/:id/reviews`)

```ts
const reviews = await prisma.review.findMany({
  where: { productId: parseInt(id) },
  include: { user: { select: { name: true } } },
  orderBy: { createdAt: 'desc' }
});
```

---

## 3. Frontend — Componente `StarRating`

### `frontend/src/components/StarRating.tsx`

Props:
```ts
interface StarRatingProps {
  rating: number;           // promedio (p.ej. 4.2)
  count?: number;           // cantidad de reseñas (opcional)
  size?: 'sm' | 'md' | 'lg';
  onRate?: (rating: number) => void;  // si se pasa, es interactivo
  readOnly?: boolean;       // forzar solo lectura
}
```

- 5 estrellas SVG inline
- Modo interactivo: hover pinta estrellas, click envía calificación
- Modo lectura: muestra el promedio con media estrella si aplica
- Muestra el count si se provee: `★★★★☆ (4.2) · 12 reseñas`

---

## 4. Frontend — Catálogo con calificaciones

### `frontend/src/pages/Products.tsx`

- Agregar `averageRating` y `reviewCount` al interface `Product`
- En cada tarjeta de producto, mostrar `<StarRating>` debajo del precio
- Si el usuario está logueado, permitir clic para calificar
- Llamar `api.products.addReview(productId, { rating })` con retroalimentación visual inmediata

### Estados a manejar:
- **Loading:** skeleton mientras carga
- **Empty:** producto sin reseñas → "Sin calificaciones" texto gris
- **Error:** error al cargar/guardar → toast o mensaje
- **Success:** rating actualizado → feedback visual (cambio instantáneo de estrellas)
- **Duplicado:** upsert maneja actualización silenciosa

---

## 5. Frontend — API Layer

### `frontend/src/services/api.ts`

Agregar al objeto `api.products`:

```ts
getReviews: async (productId: number) =>
  fetchWithAuth(`/products/${productId}/reviews`).then(r => r.json()),

addReview: async (productId: number, data: { rating: number; comment?: string }) =>
  fetchWithAuth(`/products/${productId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data)
  }).then(r => r.json()),
```

---

## Archivos a modificar/crear

```
CREAR:
  frontend/src/components/StarRating.tsx

MODIFICAR:
  backend/prisma/schema.prisma          # +Review model, +relation en User/Product
  backend/prisma/seed.ts                 # +sample reviews
  backend/src/routes/products.ts         # +reviews endpoints, +avg rating en listado
  frontend/src/pages/Products.tsx        # +star display + interactive rating
  frontend/src/services/api.ts           # +reviews API methods (getReviews, addReview)
```

---

## Orden de implementación

1. Schema + migración
2. Seed datos
3. Backend endpoints
4. API layer frontend
5. Componente StarRating
6. Integración en catálogo

---

## No incluido (alcance futuro)

- Página de detalle de producto con reviews completas
- Filtro por calificación mínima
- Ordenar por calificación
- Admin panel para moderar reseñas
- Comentarios de texto en la UI (el campo existe en DB pero no se expone en catálogo)
