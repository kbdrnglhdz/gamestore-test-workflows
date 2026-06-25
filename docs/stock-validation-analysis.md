# Análisis: Falta de validación de stock en checkout

## Resumen

El modelo `Product` en el schema (`backend/prisma/schema.prisma:28`) tiene un campo `stock: Int`, y `cart.ts:59` sí valida stock al agregar items al carrito. Sin embargo, el endpoint de checkout en `orders.ts` omite por completo la verificación de stock antes de crear la orden.

## Flujo del bug

1. **Usuario agrega al carrito** → `POST /api/cart/add` en `backend/src/routes/cart.ts:59` verifica `product.stock >= quantity`. Si hay stock, pasa.
2. **Entre el add y el checkout**, el stock puede cambiar (otra compra, actualización de inventario, etc.).
3. **Usuario hace checkout** → `POST /api/orders/checkout` en `backend/src/routes/orders.ts:26-27` crea la orden **sin verificar stock actual**.
4. **Resultado:** Se crea una orden con items sin stock suficiente.

## Archivos involucrados

| Archivo | Rol | Líneas clave |
|---------|-----|-------------|
| `backend/prisma/schema.prisma` | Schema de datos con `stock: Int` en Product | 22-33 |
| `backend/src/routes/orders.ts` | Endpoint `POST /checkout` sin validación de stock | 26-27 |
| `backend/src/routes/cart.ts` | Endpoint `POST /add` con validación de stock (sí existe) | 59-61 |
| `frontend/src/pages/Checkout.tsx` | Frontend que llama al API sin verificar stock | 33-34 |

## Causa raíz

`orders.ts` recorre los items del carrito y crea `orderItems` directamente (líneas 32-41) sin consultar `product.stock` para cada item. Los comentarios en el código lo confirman:

```ts
// BUG: No validation that stock is sufficient
// TODO: Validate stock before creating order
```

## Dónde debería ir la corrección

En `backend/src/routes/orders.ts`, antes del bucle que crea `orderItems` (línea 32), se debe:

1. Iterar cada item del carrito
2. Consultar `product.stock` actual desde la base de datos
3. Verificar `product.stock >= item.quantity`
4. Si algún producto no tiene stock suficiente, rechazar la orden completa con error 400

## Notas adicionales

- `cart.ts` ya tiene validación de stock funcional (línea 59), lo que hace que el bug sea más sutil: el stock se valida al agregar al carrito pero no al finalizar la compra.
- No hay validación de stock en el frontend (`Checkout.tsx`) ni en ningún middleware.
