## 1. Preparación

- [x] 1.1 Crear rama `feature/test-ci-2-related-products`
- [x] 1.2 Leer y entender el diseño y specs del cambio

## 2. Backend — Endpoint de productos relacionados

- [x] 2.1 Agregar handler `GET /:id/related` en `backend/src/routes/products.ts` con validación de ID numérico
- [x] 2.2 Implementar query analytics: buscar productos comprados juntos vía `OrderItem` usando `$queryRaw` (COUNT, GROUP BY, ORDER BY, LIMIT 5)
- [x] 2.3 Implementar fallback por categoría: `prisma.product.findMany` con `where: { category, id: { not } }` cuando analytics retorna menos de 5
- [x] 2.4 Combinar resultados: analytics primero, completar con categoría, deduplicar, limitar a 5
- [x] 2.5 Escribir tests unitarios para el endpoint (producto existe, no existe, analytics retorna resultados, fallback por categoría, sin relacionados)

## 3. Frontend — UI de productos relacionados

- [x] 3.1 Agregar método `getRelated(id: number)` en `frontend/src/services/api.ts`
- [x] 3.2 Crear componente `RelatedProducts.tsx` que recibe `productId` y muestra tarjetas con imagen, nombre y precio
- [x] 3.3 Integrar `RelatedProducts` en la página de detalle de producto (crear `ProductDetail.tsx` si no existe o modificar la existente)
- [x] 3.4 Escribir tests del componente `RelatedProducts` (carga exitosa, sin resultados, error handling)

## 4. Verificación

- [x] 4.1 Smoke test: iniciar backend y frontend, navegar a detalle de producto, verificar que se muestran relacionados
- [x] 4.2 Edge case: verificar producto sin órdenes (fallback a categoría)
- [x] 4.3 Edge case: verificar producto único en su categoría (array vacío)
- [x] 4.4 Edge case: verificar ID inválido (404)
