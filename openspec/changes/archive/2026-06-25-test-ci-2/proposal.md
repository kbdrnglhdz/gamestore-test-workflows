## Why

Mejorar la experiencia de compra mostrando productos relacionados y recomendaciones basadas en la categoría del producto actual y en productos comprados juntos frecuentemente (analytics de órdenes).

## What Changes

- Nuevo endpoint `GET /api/products/:id/related` que devuelve productos relacionados
- Lógica de recomendaciones: (1) productos en la misma categoría, (2) productos comprados frecuentemente junto al producto actual (basado en `OrderItem`)
- Componente frontend para mostrar productos relacionados en la página de detalle del producto
- Método `getRelated` en el servicio API del frontend
- Pruebas backend para el nuevo endpoint

## Capabilities

### New Capabilities
- `product-recommendations`: Recomendaciones de productos relacionados basados en categoría y analytics de órdenes

### Modified Capabilities
- `catalog`: Nueva sección de requerimiento para productos relacionados

## Impact

- **Backend**: Nuevo `GET /api/products/:id/related` en `backend/src/routes/products.ts`
- **Frontend**: Nuevo componente `RelatedProducts` y actualización de `Products.tsx` (página de detalle)
- **API Service**: Nuevo método `getRelated` en `frontend/src/services/api.ts`
- **DB**: No requiere migración — `OrderItem` ya modela las relaciones producto-orden
- **Pruebas**: Nuevos tests en `backend/src/__tests__/products.test.ts`

## Riesgos

- **Riesgo**: La consulta de "comprados juntos" puede ser lenta con muchas órdenes
  - **Mitigación**: Limitar a top 5 productos y agregar `LIMIT` en la query; considerar caché si es necesario
- **Riesgo**: Productos sin órdenes no tendrían recomendaciones basadas en analytics
  - **Mitigación**: Fallback a productos de la misma categoría como estrategia por defecto

## Complejidad

Media — requiere lógica de consultas analíticas en Prisma, estrategia de fallback, y componente frontend.

## Dependencias externas

Ninguna. Toda la lógica usa Prisma ORM existente y datos de `OrderItem`.
